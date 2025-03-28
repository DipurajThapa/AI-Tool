from langchain.llms import OpenAI
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Pinecone
from langchain.memory import ConversationBufferMemory
from langchain.agents import initialize_agent, Tool
from langchain.tools import DuckDuckGoSearchTool
import pinecone
from typing import List, Dict, Any
import json
from ..main import settings

class AIService:
    def __init__(self):
        self.llm = OpenAI(
            temperature=0.7,
            openai_api_key=settings.OPENAI_API_KEY,
            model_name="gpt-4-turbo-preview"
        )
        self.embeddings = OpenAIEmbeddings(openai_api_key=settings.OPENAI_API_KEY)
        
        # Initialize Pinecone
        pinecone.init(
            api_key=settings.PINECONE_API_KEY,
            environment=settings.PINECONE_ENVIRONMENT
        )
        self.vector_store = Pinecone.from_existing_index(
            index_name="ai-business-agent",
            embedding=self.embeddings
        )
        
        # Initialize conversation memory
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )

    async def generate_content(self, prompt: str, context: Dict[str, Any] = None) -> str:
        """Generate content using OpenAI's GPT model."""
        template = """
        Context: {context}
        Task: {prompt}
        Please provide a detailed and professional response.
        """
        
        prompt_template = PromptTemplate(
            input_variables=["context", "prompt"],
            template=template
        )
        
        chain = LLMChain(
            llm=self.llm,
            prompt=prompt_template,
            memory=self.memory
        )
        
        response = await chain.arun(
            context=json.dumps(context) if context else "No additional context",
            prompt=prompt
        )
        
        return response

    async def analyze_sentiment(self, text: str) -> Dict[str, float]:
        """Analyze sentiment of text using OpenAI."""
        prompt = f"""
        Analyze the sentiment of the following text and provide scores for:
        - Positive sentiment (0-1)
        - Negative sentiment (0-1)
        - Neutral sentiment (0-1)
        
        Text: {text}
        
        Provide the response in JSON format.
        """
        
        response = await self.generate_content(prompt)
        return json.loads(response)

    async def generate_lead_score(self, lead_data: Dict[str, Any]) -> float:
        """Generate lead score based on lead data."""
        prompt = f"""
        Based on the following lead data, calculate a lead score from 0-100.
        Consider factors like:
        - Company size
        - Industry
        - Engagement level
        - Budget indicators
        
        Lead Data: {json.dumps(lead_data)}
        
        Provide only the numerical score.
        """
        
        response = await self.generate_content(prompt)
        return float(response.strip())

    async def generate_workflow_actions(self, workflow_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate AI-driven workflow actions."""
        prompt = f"""
        Based on the following workflow data, suggest appropriate actions:
        - Email communications
        - Task assignments
        - Follow-up reminders
        - Data updates
        
        Workflow Data: {json.dumps(workflow_data)}
        
        Provide the response as a JSON array of actions.
        """
        
        response = await self.generate_content(prompt)
        return json.loads(response)

    async def search_similar_content(self, query: str, k: int = 5) -> List[Dict[str, Any]]:
        """Search for similar content using vector embeddings."""
        results = self.vector_store.similarity_search_with_score(query, k=k)
        return [
            {
                "content": doc.page_content,
                "metadata": doc.metadata,
                "score": score
            }
            for doc, score in results
        ]

    async def generate_sales_proposal(self, customer_data: Dict[str, Any], product_data: Dict[str, Any]) -> str:
        """Generate a sales proposal using AI."""
        prompt = f"""
        Generate a professional sales proposal based on:
        
        Customer Data: {json.dumps(customer_data)}
        Product Data: {json.dumps(product_data)}
        
        Include:
        - Executive summary
        - Problem statement
        - Solution overview
        - Pricing details
        - Implementation timeline
        - Terms and conditions
        """
        
        return await self.generate_content(prompt)

    async def analyze_customer_feedback(self, feedback_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze customer feedback to extract insights."""
        prompt = f"""
        Analyze the following customer feedback and provide:
        1. Key themes and patterns
        2. Sentiment analysis
        3. Action items
        4. Improvement opportunities
        
        Feedback Data: {json.dumps(feedback_data)}
        
        Provide the response in JSON format.
        """
        
        response = await self.generate_content(prompt)
        return json.loads(response) 