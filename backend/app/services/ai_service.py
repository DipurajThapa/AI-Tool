from typing import List, Dict, Any
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from app.models.erp import Transaction, Employee, Invoice
from app.schemas.erp import FinancialForecast, AIRecommendation
from langchain.llms import OpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
import os
from dotenv import load_dotenv

load_dotenv()

class AIService:
    def __init__(self):
        self.llm = OpenAI(
            temperature=0.7,
            model="gpt-4",
            openai_api_key=os.getenv("OPENAI_API_KEY")
        )

    async def analyze_financial_data(self, transactions: List[Transaction]) -> FinancialForecast:
        """Analyze financial data and generate forecasts."""
        # Convert transactions to DataFrame
        df = pd.DataFrame([{
            'date': t.date,
            'amount': t.amount,
            'type': t.type,
            'category': t.category
        } for t in transactions])

        # Calculate basic statistics
        total_revenue = df[df['type'] == 'income']['amount'].sum()
        total_expenses = df[df['type'] == 'expense']['amount'].sum()
        
        # Generate forecast using historical data
        forecast = self._generate_forecast(df)
        
        return FinancialForecast(
            predicted_revenue=forecast['revenue'],
            predicted_expenses=forecast['expenses'],
            confidence_score=forecast['confidence'],
            factors=forecast['factors']
        )

    async def generate_recommendations(
        self,
        transactions: List[Transaction],
        employees: List[Employee],
        invoices: List[Invoice]
    ) -> List[AIRecommendation]:
        """Generate AI-powered recommendations based on current data."""
        recommendations = []

        # Analyze expense patterns
        expense_recommendations = self._analyze_expenses(transactions)
        recommendations.extend(expense_recommendations)

        # Analyze employee retention risk
        retention_recommendations = self._analyze_employee_retention(employees)
        recommendations.extend(retention_recommendations)

        # Analyze invoice processing
        invoice_recommendations = self._analyze_invoices(invoices)
        recommendations.extend(invoice_recommendations)

        return recommendations

    def _generate_forecast(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Generate financial forecast using historical data."""
        # Group by month and calculate monthly totals
        monthly_data = df.groupby(df['date'].dt.to_period('M')).agg({
            'amount': 'sum'
        }).reset_index()

        # Calculate growth rates
        monthly_data['growth_rate'] = monthly_data['amount'].pct_change()

        # Generate forecast for next 3 months
        last_month = monthly_data.iloc[-1]
        forecast_revenue = last_month['amount'] * (1 + last_month['growth_rate'])
        forecast_expenses = last_month['amount'] * 0.8  # Assuming 80% of revenue

        # Calculate confidence score based on historical volatility
        volatility = monthly_data['growth_rate'].std()
        confidence = max(0, 1 - volatility)

        # Identify key factors affecting the forecast
        factors = self._identify_forecast_factors(monthly_data)

        return {
            'revenue': float(forecast_revenue),
            'expenses': float(forecast_expenses),
            'confidence': float(confidence),
            'factors': factors
        }

    def _analyze_expenses(self, transactions: List[Transaction]) -> List[AIRecommendation]:
        """Analyze expense patterns and generate recommendations."""
        recommendations = []
        
        # Group expenses by category
        expenses = [t for t in transactions if t.type == 'expense']
        category_totals = {}
        for expense in expenses:
            category_totals[expense.category] = category_totals.get(expense.category, 0) + expense.amount

        # Identify high-spending categories
        total_expenses = sum(category_totals.values())
        for category, amount in category_totals.items():
            percentage = amount / total_expenses
            if percentage > 0.3:  # If category represents more than 30% of expenses
                recommendations.append(AIRecommendation(
                    type="expense_optimization",
                    message=f"High spending in {category} category ({percentage:.1%} of total expenses)",
                    impact="medium",
                    priority="high",
                    action_items=[
                        f"Review {category} expenses for potential cost reduction",
                        "Consider negotiating better rates with vendors",
                        "Implement budget controls for this category"
                    ]
                ))

        return recommendations

    def _analyze_employee_retention(self, employees: List[Employee]) -> List[AIRecommendation]:
        """Analyze employee data for retention risks."""
        recommendations = []

        # Calculate average tenure
        now = datetime.utcnow()
        tenures = [(now - emp.hire_date).days for emp in employees]
        avg_tenure = sum(tenures) / len(tenures)

        # Identify potential retention risks
        if avg_tenure < 365:  # Less than 1 year average tenure
            recommendations.append(AIRecommendation(
                type="employee_retention",
                message="Low average employee tenure detected",
                impact="high",
                priority="medium",
                action_items=[
                    "Review compensation and benefits package",
                    "Implement employee engagement programs",
                    "Conduct exit interviews to identify issues"
                ]
            ))

        return recommendations

    def _analyze_invoices(self, invoices: List[Invoice]) -> List[AIRecommendation]:
        """Analyze invoice processing and generate recommendations."""
        recommendations = []

        # Check for overdue invoices
        now = datetime.utcnow()
        overdue_invoices = [inv for inv in invoices if inv.due_date < now and inv.status != 'paid']
        
        if overdue_invoices:
            recommendations.append(AIRecommendation(
                type="invoice_processing",
                message=f"{len(overdue_invoices)} overdue invoices detected",
                impact="medium",
                priority="high",
                action_items=[
                    "Review and process overdue invoices",
                    "Implement automated payment reminders",
                    "Consider early payment discounts"
                ]
            ))

        return recommendations

    def _identify_forecast_factors(self, monthly_data: pd.DataFrame) -> List[str]:
        """Identify key factors affecting the financial forecast."""
        factors = []

        # Analyze trend
        trend = monthly_data['amount'].pct_change().mean()
        if trend > 0.1:
            factors.append("Strong upward trend in revenue")
        elif trend < -0.1:
            factors.append("Declining revenue trend")

        # Analyze seasonality
        if len(monthly_data) >= 12:
            seasonal_pattern = monthly_data['amount'].rolling(window=12).std()
            if seasonal_pattern.iloc[-1] > monthly_data['amount'].mean() * 0.2:
                factors.append("Significant seasonal variations")

        # Analyze volatility
        volatility = monthly_data['amount'].pct_change().std()
        if volatility > 0.2:
            factors.append("High revenue volatility")

        return factors 