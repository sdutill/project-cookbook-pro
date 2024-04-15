import React, { useState } from "react";
import OpenAI from "openai";
import FirestoreService from "../../../firebase/FirebaseService";
import { useAuth } from "../../../utils/AuthContext.js";

const GPT = () => {
  const [response, setResponse] = useState("");
  const [recipeNames, setRecipeNames] = useState([]);
  const [responseHistory, setResponseHistory] = useState([]);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (recipeType) => {
    setLoading(true);

    // Clear any previous errors and responses
    setError("");
    setResponse("");

    if (!user || !user.uid) {
      setError("User not authenticated.");
      return;
    }

    // Fetch saved recipes
    const getSavedRecipes = async () => {
      const collectionPath = `Users/${user.uid}/SavedRecipes`;
      try {
        const allDocuments = await FirestoreService.getAllDocuments(
          collectionPath,
          "recipes"
        );
        const names = allDocuments.map((doc) => doc.data.name);
        return names; // Return the names for use below
      } catch (error) {
        console.error("Error fetching saved recipes:", error);
        throw new Error("Failed to fetch saved recipes.");
      }
    };

    try {
      const recipeNames = await getSavedRecipes(); // Ensure this completes before moving on
      setRecipeNames(recipeNames); // Update the state with the names

      const json_example = {
        cuisine: "PLEASE REPLACE WITH CUISINE TYPE HERE",
        dishType: "PLEASE REPLACE WITH BREAKFAST LUNCH OR DINNER",
        id: "0",
        image: "TO BE ADDED",
        ingredients: [
          "PLEASE INSERT INGREDIENTS AND THEIR QUANTITY",
        ],
        instructions: [
          "PLEASE INSERT LIST OF INSTRUCTIONS"
        ],
        name: "PLEASE INSERT NAME OF GENERATED DISH",
        servings: "PLEASE INSERT INTEGER OF SERVINGS",
        summary: "PLEASE INSERT A SUMMARY FOR GENERATED RECIPE.",
        savedRecipeInspiration: "PLEASE INSERT SAVED RECIPE THAT INSPIRED RESPONSE",
        inspirationReasoning: "PLEASE INSERT REASONING FOR GENERATED RECIPE BASED ON SAVED RECIPE"
      };

      const exampleString=JSON.stringify(json_example,null,2);
      console.log

      // Prepare for OpenAI request
      const openai = new OpenAI({
        apiKey: process.env.REACT_APP_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
      });
      const gptModel = "gpt-4-0125-preview";
      const recipeListString = recipeNames.join(", ");
      const systemMessageContent = `You are a recipe recommendation system. You must respond with a recipe for ${recipeType} to the user, you cannot ask clarifying questions, and you cannot refuse to generate a recipe. name, servings, a summary including instructions, ingredients and their amounts. The text will be displayed on a webpage for the user to view, so it should be easy to read,presentable, and organized in a way that resembles a cookbook. Your response should take in to account both the recipe type and saved recipes. Your generated recipe should be reflective of the users taste based on saved recipes, but you should ensure that the recipe and the saved recipe for inspiration is unique. Please ensure that you generate a recipe that shares a key ingredient with the inspiration recipe from the users saved recipes. The user's previously saved recipes include: ${recipeListString}. Your response should be a json in this format ${exampleString}. Do not use backticks in your response. And do not repeat yourself you've currently suggested:${responseHistory}`;
      console.log(systemMessageContent)
      const userMessage = [
        { role: "system", content: systemMessageContent },
        {
          role: "user",
          content: `Generate a ${recipeType} inspired by the following: ${recipeListString}`,
        },
      ];

      const completion = await openai.chat.completions.create({
        model: gptModel,
        messages: userMessage,
      });

      // Process and handle OpenAI response
      const assistantResponse = completion.choices?.find(
        (choice) => choice.message.role === "assistant"
      );
      if (assistantResponse) {
        setResponse(assistantResponse.message.content);
        setResponseHistory((prevHistory) => [
          assistantResponse.message.content,
          ...prevHistory,
        ]);
        setLoading(false);
        const collectionPath = `Users/${user.uid}/generatedRecipes`;
        const documentId = `gpt-${Date.now()}-${Math.floor(
          Math.random() * 1000
        )}`;
        const gptResponse = {
          userMessage: `I want a recipe for ${recipeType}`,
          assistantResponse: assistantResponse.message.content,
        };
        await FirestoreService.createDocument(
          collectionPath,
          documentId,
          gptResponse,
          "gptResponse"
        );
      } else {
        throw new Error("Assistant response not found");
      }
    } catch (error) {
      setLoading(false);
      setError("Error: " + error.message);
      console.error("Error:", error);
    }
  };

  return {
    response,
    responseHistory,
    error,
    loading,
    handleSubmit,
  };
};

export default GPT;
