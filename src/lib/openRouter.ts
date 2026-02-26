const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface Model {
    id: string;
    name: string;
    description?: string;
}

export async function fetchModels(): Promise<Model[]> {
    try {
        const response = await fetch('https://openrouter.ai/api/v1/models');
        const data = await response.json();
        return data.data.map((m: any) => ({
            id: m.id,
            name: m.name,
            description: m.description
        }));
    } catch (error) {
        console.error('Error fetching OpenRouter models:', error);
        return [];
    }
}

export async function sendMessage(messages: Message[], modelId: string): Promise<string> {
    if (!OPENROUTER_API_KEY) {
        return "Error: VITE_OPENROUTER_API_KEY is not set in environment variables.";
    }

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": modelId,
                "messages": messages
            })
        });

        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
            return data.choices[0].message.content;
        }
        return "Error: No response from OpenRouter.";
    } catch (error) {
        console.error('Error calling OpenRouter API:', error);
        return `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
}
