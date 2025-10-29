import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, type = "suggest", imageBase64, referenceUrl, appRole, apiSettings } = await req.json();
    
    // Handle API connection test
    if (type === "test") {
      console.log('Testing API connection');
      
      if (!apiSettings?.useExternalApi || !apiSettings?.apiKey) {
        return new Response(
          JSON.stringify({ error: "API settings not provided for test" }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      try {
        // Test OpenAI connection with a minimal request
        const testResponse = await fetch('https://api.openai.com/v1/models', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiSettings.apiKey}`,
          },
        });

        if (!testResponse.ok) {
          const errorText = await testResponse.text();
          console.error('API test failed:', testResponse.status, errorText);
          
          if (testResponse.status === 401) {
            return new Response(
              JSON.stringify({ error: "Invalid API key" }),
              { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          throw new Error(`API test failed: ${testResponse.status}`);
        }

        return new Response(
          JSON.stringify({ success: true, message: "API connection successful" }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('API test error:', error);
        return new Response(
          JSON.stringify({ error: error instanceof Error ? error.message : "Connection test failed" }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    console.log('Received request:', { 
      prompt: prompt?.substring(0, 100), 
      type, 
      hasImage: !!imageBase64, 
      referenceUrl, 
      appRole,
      apiSettings: apiSettings ? {
        useExternalApi: apiSettings.useExternalApi,
        provider: apiSettings.provider,
        hasApiKey: !!apiSettings.apiKey,
        model: apiSettings.model
      } : null
    });

    // Check if using external API
    const useExternalApi = apiSettings?.useExternalApi === true && apiSettings?.apiKey;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    console.log('API mode:', useExternalApi ? 'External OpenAI' : 'Lovable AI');
    
    if (!useExternalApi && !LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured and external API not enabled');
      throw new Error('LOVABLE_API_KEY is not configured');
    }
    
    if (useExternalApi && !apiSettings.apiKey) {
      console.error('External API enabled but no API key provided');
      throw new Error('External API key is required when external API is enabled');
    }

    // If it's a suggestion request, use text generation
    if (type === "suggest") {
      const roleContext = appRole ? `\n\nIMPORTANT - Brand/App Context: ${appRole}. ALL suggestions MUST align with and reflect this brand identity and style. Ensure the visual style, tone, and messaging are consistent with this brand context.` : '';
      const systemPrompt = `You are an elite creative director and advertising strategist with expertise in crafting campaigns for world-class publications like WSJ, NYT, Vogue, and Hypebeast. 

Your mission: Transform user prompts into premium, editorial-quality advertisement concepts that rival the sophistication of Hollywood productions and luxury brand campaigns.

CREATIVE EXCELLENCE STANDARDS:
- Visual Storytelling: Create narratives that evoke emotion and capture attention instantly
- Cinematic Composition: Think in terms of lighting, depth, perspective, and dramatic framing
- Editorial Polish: Every element should feel meticulously art-directed
- Cultural Resonance: Tap into current trends while maintaining timeless appeal
- Premium Aesthetics: Luxury materials, sophisticated color palettes, refined typography
- Authentic Emotion: Real moments over staged perfection
${roleContext}

QUALITY BENCHMARKS:
- Hollywood Production Quality: Cinematic lighting, dramatic angles, perfect timing
- Editorial Standards: WSJ/NYT level sophistication, clean layouts, purposeful negative space
- Fashion Magazine Excellence: Vogue-level styling, aspirational yet authentic
- Contemporary Edge: Hypebeast/Bazaar innovative approaches, bold creative choices

Return 3 refined variations optimized for different creative approaches (Cinematic Editorial, Bold Contemporary, Sophisticated Luxury).`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "suggest_prompts",
                description: "Return 3 refined advertisement prompt variations",
                parameters: {
                  type: "object",
                  properties: {
                    suggestions: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          title: { type: "string", description: "Style name (e.g., 'Modern & Minimalist')" },
                          prompt: { type: "string", description: "Refined advertisement description" },
                          description: { type: "string", description: "Brief explanation of the style" }
                        },
                        required: ["title", "prompt", "description"],
                        additionalProperties: false
                      },
                      minItems: 3,
                      maxItems: 3
                    }
                  },
                  required: ["suggestions"],
                  additionalProperties: false
                }
              }
            }
          ],
          tool_choice: { type: "function", function: { name: "suggest_prompts" } }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI gateway error:', response.status, errorText);
        
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: "Credits depleted. Please add credits to continue." }),
            { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        throw new Error(`AI Gateway error: ${response.status}`);
      }

      const data = await response.json();
      console.log('AI response received');

      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall) {
        throw new Error('No tool call in response');
      }

      const suggestions = JSON.parse(toolCall.function.arguments).suggestions;

      return new Response(
        JSON.stringify({ suggestions }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If it's a link analysis request
    if (type === "analyze") {
      const systemPrompt = `You are an expert at analyzing advertisements. Extract key visual elements, messaging strategies, and creative concepts from the description or reference.`;

      const analysisPrompt = referenceUrl 
        ? `Analyze this advertisement reference: ${referenceUrl}. Describe the visual style, color palette, composition, messaging approach, and target audience. Then create a detailed prompt for generating a similar ad.`
        : `Analyze this advertisement concept: ${prompt}. Provide insights on visual style, messaging, and target audience, then create an optimized prompt for generating a similar ad.`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: analysisPrompt }
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Analysis error:', response.status, errorText);
        throw new Error(`Analysis error: ${response.status}`);
      }

      const data = await response.json();
      const analysis = data.choices?.[0]?.message?.content;

      return new Response(
        JSON.stringify({ analysis }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If it's an image generation request
    if (type === "generate") {
      console.log('Generating image with prompt:', prompt, 'Has reference image:', !!imageBase64, 'Using external API:', useExternalApi);
      
      // Use external OpenAI API if configured
      if (useExternalApi) {
        console.log('Using external OpenAI API with model:', apiSettings.model);
        try {
          const requestBody = {
            model: apiSettings.model || 'gpt-image-1',
            prompt: `Premium editorial advertisement, Hollywood production quality, sophisticated composition: ${prompt}. Ultra high resolution, professional photography, cinematic lighting, award-winning creative direction.`,
            n: 2,
            size: '1024x1536',
            quality: 'high',
            style: 'natural'
          };
          
          console.log('OpenAI request:', { ...requestBody, prompt: requestBody.prompt.substring(0, 100) + '...' });
          
          const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiSettings.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenAI API error:', response.status, errorText);
            
            if (response.status === 401) {
              return new Response(
                JSON.stringify({ error: "Invalid OpenAI API key. Please check your API key in settings." }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
            if (response.status === 429) {
              return new Response(
                JSON.stringify({ error: "OpenAI rate limit exceeded. Please try again later." }),
                { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
            
            throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
          }

          const data = await response.json();
          console.log('OpenAI response received with', data.data?.length, 'images');
          
          const variations = data.data.map((item: any, idx: number) => ({
            imageUrl: item.url,
            style: idx === 0 ? "Editorial Premium" : "Cinematic Luxury"
          }));

          return new Response(
            JSON.stringify({ variations }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          console.error('External API error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to generate image with external API';
          return new Response(
            JSON.stringify({ error: errorMessage }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
      
      // Define style variations for generating multiple options with Lovable AI
      const styleVariations = [
        { 
          name: "Cinematic Editorial", 
          modifier: "Cinematic Hollywood-level production quality with dramatic lighting, sophisticated composition, editorial polish. Think WSJ Magazine meets Vogue - refined, aspirational, meticulously art-directed. Professional photography with depth, emotion, and premium aesthetics." 
        },
        { 
          name: "Sophisticated Luxury", 
          modifier: "Ultra-premium luxury brand aesthetic with elegant minimalism, sophisticated color palette, refined simplicity. Think high-end fashion campaigns - clean, timeless, effortlessly expensive. Studio-quality lighting with perfect balance and contemporary elegance." 
        }
      ];

      const variations = [];

      // Generate multiple variations with Lovable AI
      for (const style of styleVariations) {
        const roleContext = appRole ? `Brand Identity: ${appRole}. The image MUST embody this brand's essence, values, and visual language at the highest creative standard. ` : '';
        let enhancedPrompt = imageBase64 
          ? `${roleContext}${prompt}. Creative Direction: ${style.modifier} World-class art direction with meticulous attention to every visual element.` 
          : `${roleContext}Premium editorial advertisement: ${prompt}. Creative Direction: ${style.modifier} Award-winning photography, masterful composition, flawless execution. Ultra high resolution 8K, professional color grading, museum-quality production values, campaign-ready output.`;

        const messageContent: any[] = [
          {
            type: "text",
            text: enhancedPrompt
          }
        ];

        // Add reference image if provided
        if (imageBase64) {
          messageContent.push({
            type: "image_url",
            image_url: {
              url: imageBase64
            }
          });
        }
        
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image-preview",
            messages: [
              {
                role: "user",
                content: messageContent
              }
            ],
            modalities: ["image", "text"]
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Image generation error:', response.status, errorText);
          
          if (response.status === 429) {
            return new Response(
              JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
              { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          if (response.status === 402) {
            return new Response(
              JSON.stringify({ error: "Credits depleted. Please add credits to continue." }),
              { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          throw new Error(`Image generation error: ${response.status}`);
        }

        const data = await response.json();
        const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        
        if (!imageUrl) {
          console.error('No image URL in response for style:', style.name);
          continue;
        }

        variations.push({
          imageUrl,
          style: style.name
        });
      }

      console.log('Generated', variations.length, 'variations successfully');

      if (variations.length === 0) {
        throw new Error('No images generated');
      }

      return new Response(
        JSON.stringify({ variations }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid type parameter');

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
