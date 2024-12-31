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
  const [feedback, setFeedback] = useState('');
  const maxQuestions = 5;
  const [contactDetails, setContactDetails] = useState({ phone: '', email: '' });

  const generateHashId = () => uuidv4();

  const storeDataInDynamoDB = async (data) => {
    try {
      const dynamoDbUrl = 'https://viw5kle5t7.execute-api.us-east-2.amazonaws.com/storedynamodata';

      await axios.post(dynamoDbUrl, data, {
        headers: {
          "Content-Type": 'application/json'
        },
      });

      console.log('Data successfully stored in DynamoDB:', data);
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
        const parsedResponse = JSON.parse(botResponse);

        setFollowUpQuestions(parsedResponse.next_questions || []);
        setResponse(parsedResponse.risk_level || 'Response received');
        setQuestionsAsked((prev) => prev + 1);
        setInput('');
        setSelectedOption('');
        setSelectedCheckboxes([]);

        // Store question and feedback in DynamoDB
        const postData = {
          hash_id: generateHashId(),
          question: userMessage,
          feedback: feedback || '',
        };

        storeDataInDynamoDB(postData);
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

  const handleSubmitContact = () => {
    const postData = {
      hash_id: generateHashId(),
      contact: contactDetails,
    };

    storeDataInDynamoDB(postData);
    setResponse('Thank you! Your contact information has been saved.');
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
            <textarea
              placeholder="Provide your feedback here..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            ></textarea>
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
                      onChange={(e) => setSelectedCheckboxes((prev) =>
                        e.target.checked ? [...prev, e.target.value] : prev.filter((item) => item !== e.target.value)
                      )}
                    />
                    <label htmlFor={`checkbox-${index}`}>{questionObj.question}</label>
                  </div>
                ))}
            <textarea
              placeholder="Provide your feedback here..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            ></textarea>
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
          <Button variant="contained" onClick={handleSubmitContact}>
            Submit
          </Button>
        </div>
      )}
    </div>
  );
};

export default Chat;