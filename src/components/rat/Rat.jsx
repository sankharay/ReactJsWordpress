import React, { useState } from 'react';
import axios from 'axios';
import '../../assets/css/Rat.css';
import InputAdornment from '@mui/material/InputAdornment';
import Input from '@mui/material/Input';
import { Search, Place } from '@mui/icons-material';
import Button from '@mui/material/Button';
import { v4 as uuidv4 } from 'uuid';

const Chat = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [followUpQuestions, setFollowUpQuestions] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
  const maxQuestions = 5;
  const [contactDetails, setContactDetails] = useState({ phone: '', email: '' });

  const generateHashId = () => uuidv4();

  const storeDataInDynamoDB = async (question) => {
    try {
      const hashId = generateHashId();
      const ipAddress = await axios
        .get('https://api64.ipify.org?format=json')
        .then((res) => res.data.ip)
        .catch(() => '0.0.0.0'); // Fallback IP if API fails

      const postData = {
        hash_id: hashId,
        ip_address: ipAddress,
        question: question,
      };

      console.log('Sending data to DynamoDB:', postData);

      const dynamoDbUrl = 'https://viw5kle5t7.execute-api.us-east-2.amazonaws.com/storedynamodata';

      await axios.post(dynamoDbUrl, postData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer 123213213131`,
          'Access-Control-Allow-Origin': '*', // Allow all origins during development
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        },
      });

      console.log('Data successfully stored in DynamoDB:', postData);
    } catch (error) {
      console.error('Error storing data in DynamoDB:', error.response?.data || error.message);
    }
  };

  const sendMessage = async () => {
    if (questionsAsked >= maxQuestions) {
      setResponse(
        'Thank you for your responses! Please enter your phone number and email address so we can reach you.'
      );
      return;
    }

    try {
      const apiUrl = 'https://api.openai.com/v1/chat/completions';
      const apiKey = import.meta.env.VITE_CHATGBT_API_KEY;
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      };

      const userMessage = selectedOption
        ? `User selected: ${selectedOption}`
        : selectedCheckboxes.length > 0
        ? `User selected: ${selectedCheckboxes.join(', ')}`
        : input;

      const requestBody = {
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content: `${userMessage} Please respond in the following format: {"risk_level": "string", "next_questions": [{"question": "string","type": "string"}]} in JSON format only, without any additional text or explanations.`,
          },
        ],
        temperature: 0.7,
      };

      const { data } = await axios.post(apiUrl, requestBody, { headers });

      const botResponse = data.choices[0].message.content;

      // Validate response format
      try {
        const parsedResponse = JSON.parse(botResponse); // Attempt to parse as JSON

        setFollowUpQuestions(parsedResponse.next_questions || []);
        setResponse(parsedResponse.risk_level || 'Response received');
        setQuestionsAsked((prev) => prev + 1);
        setInput('');
        setSelectedOption('');
        setSelectedCheckboxes([]);

        // Store data in DynamoDB
        storeDataInDynamoDB(userMessage);
      } catch (parseError) {
        // Handle non-JSON response
        setResponse(
          'We could not process your response. Please provide your phone number and email address for contact.'
        );
        setFollowUpQuestions([]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setResponse('An error occurred. Please try again.');
    }
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setSelectedCheckboxes((prev) =>
      checked ? [...prev, value] : prev.filter((item) => item !== value)
    );
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactDetails((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      {questionsAsked < maxQuestions ? (
        followUpQuestions.length === 0 ? (
          <div className="feedBackTextField">
            <Input
              type="text"
              className="findaddress"
              id="input-with-icon-adornment"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              }
              endAdornment={
                <InputAdornment position="start">
                  <Place />
                </InputAdornment>
              }
            />
            <button onClick={sendMessage}>Ask</button>
          </div>
        ) : (
          <div className="questionWindow">
            {questionsAsked === 1
              ? followUpQuestions.map((questionObj, index) => (
                  <div className="questions" key={index}>
                    <input
                      type="radio"
                      id={`radio-${index}`}
                      name="followUp"
                      value={questionObj.question}
                      onChange={(e) => setSelectedOption(e.target.value)}
                    />
                    <label htmlFor={`radio-${index}`}>{questionObj.question}</label>
                  </div>
                ))
              : followUpQuestions.map((questionObj, index) => (
                  <div className="questions" key={index}>
                    <input
                      type="checkbox"
                      id={`checkbox-${index}`}
                      value={questionObj.question}
                      onChange={handleCheckboxChange}
                    />
                    <label htmlFor={`checkbox-${index}`}>{questionObj.question}</label>
                  </div>
                ))}
            <Button onClick={sendMessage} variant="contained">
              Ask
            </Button>
          </div>
        )
      ) : (
        <div className="contactForm">
          <p>{response}</p>
          <div className="contactForm-input">
            <Input
              type="text"
              name="phone"
              placeholder="Enter your phone number"
              value={contactDetails.phone}
              onChange={handleContactChange}
            />
          </div>
          <div className="contactForm-input">
            <Input
              type="text"
              name="email"
              placeholder="Enter your email address"
              value={contactDetails.email}
              onChange={handleContactChange}
            />
          </div>
          <Button variant="contained" onClick={() => console.log(contactDetails)}>
            Submit
          </Button>
        </div>
      )}
    </div>
  );
};

export default Chat;