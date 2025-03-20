"""
OpenAI service for generating property descriptions and processing voice commands.

This module provides functions to interact with OpenAI's API for generating
property descriptions from images and transcribing/processing voice commands.
"""
from typing import Any, Dict, List, Optional

from openai import AsyncOpenAI

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

# Initialize OpenAI client
client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


async def generate_property_description(
    image_url: str, 
    property_type: Optional[str] = None,
    location_info: Optional[Dict[str, Any]] = None
) -> Dict[str, str]:
    """
    Generate a property description from an image using OpenAI's Vision API.
    
    Args:
        image_url: URL of the property image
        property_type: Optional property type for context (e.g., "apartment", "house")
        location_info: Optional location information for context
        
    Returns:
        Dict[str, str]: Dictionary containing generated title and description
    """
    try:
        logger.info(f"Generating description for image: {image_url}")
        
        # Prepare context for the prompt
        context = ""
        if property_type:
            context += f"This is a {property_type}. "
        if location_info:
            context += f"Located in {location_info.get('city', '')}, {location_info.get('state', '')}. "
        
        # Create the prompt
        prompt = (
            f"{context}Describe this property in detail as a real estate listing. "
            "Include notable features, architectural style, condition, and potential selling points. "
            "Also suggest a catchy title for this property listing."
        )
        
        # Call OpenAI API
        response = await client.chat.completions.create(
            model="gpt-4-vision-preview",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {"url": image_url},
                        },
                    ],
                }
            ],
            max_tokens=500,
        )
        
        # Process the response
        full_text = response.choices[0].message.content
        
        # Extract title and description
        lines = full_text.split("\n")
        title = ""
        description = full_text
        
        # Try to extract title from the first line
        if lines and lines[0]:
            if ":" in lines[0]:
                title = lines[0].split(":", 1)[1].strip()
            else:
                title = lines[0].strip()
            
            # Remove title from description
            description = "\n".join(lines[1:]).strip()
        
        logger.info(f"Generated title: {title}")
        logger.debug(f"Generated description: {description[:100]}...")
        
        return {
            "title": title,
            "description": description,
        }
        
    except Exception as e:
        logger.error(f"Error generating property description: {str(e)}")
        return {
            "title": "Property Listing",
            "description": "No description available.",
        }


async def transcribe_audio(audio_file_path: str) -> str:
    """
    Transcribe audio file to text using OpenAI's Whisper API.
    
    Args:
        audio_file_path: Path to the audio file
        
    Returns:
        str: Transcribed text
    """
    try:
        logger.info(f"Transcribing audio file: {audio_file_path}")
        
        with open(audio_file_path, "rb") as audio_file:
            response = await client.audio.transcriptions.create(
                file=audio_file,
                model="whisper-1",
                language="en",
            )
        
        transcription = response.text
        logger.info(f"Transcription completed: {transcription[:100]}...")
        
        return transcription
        
    except Exception as e:
        logger.error(f"Error transcribing audio: {str(e)}")
        return ""


async def process_voice_command(command_text: str) -> Dict[str, Any]:
    """
    Process a voice command using OpenAI's API.
    
    Args:
        command_text: Transcribed voice command text
        
    Returns:
        Dict[str, Any]: Processed command with intent and parameters
    """
    try:
        logger.info(f"Processing voice command: {command_text}")
        
        # Define system prompt for command processing
        system_prompt = """
        You are an AI assistant for a real estate app called Rivo. Parse the user's voice command and extract the intent and parameters.
        
        Supported intents:
        1. schedule_viewing - Schedule a property viewing
        2. send_email - Send an email about a property
        3. save_note - Save a note about a property
        4. search_properties - Search for properties
        5. get_directions - Get directions to a property
        
        Return a JSON object with the following structure:
        {
            "intent": "intent_name",
            "parameters": {
                "param1": "value1",
                "param2": "value2"
            },
            "response": "A natural language response to the user"
        }
        """
        
        # Call OpenAI API
        response = await client.chat.completions.create(
            model="gpt-4-turbo",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": command_text},
            ],
            temperature=0.2,
        )
        
        # Parse the response
        result = response.choices[0].message.content
        logger.info(f"Processed command result: {result}")
        
        # Convert string to dict (OpenAI should return valid JSON)
        import json
        parsed_result = json.loads(result)
        
        return parsed_result
        
    except Exception as e:
        logger.error(f"Error processing voice command: {str(e)}")
        return {
            "intent": "unknown",
            "parameters": {},
            "response": "I'm sorry, I couldn't process that command.",
        }
