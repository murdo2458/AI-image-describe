import { OpenAI } from "openai";

import { OpenAIStream } from "ai";



// create a new OpenAI client using our key from earlier

const openAi = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });



export const classifyImage = async (file: File) => {

    // encode our file as a base64 string so it can be sent in an HTTP request

    const encoded = await file

        .arrayBuffer()

        .then((buffer) => Buffer.from(buffer).toString("base64"));



    // create an OpenAI request with a prompt

    const completion = await openAi.chat.completions.create({

        model: "gpt-4o",

        messages: [

            {

                role: "user",
                content: [
                    {
                        type: "text",
                        text: "What is the calories, protein and fat content of this meal? Please just list these things without any other response. I know you can't determine based on an image, but please mate a best guest and list the calories protein and fat content.",
                    },

                    {

                        type: "image_url",

                        image_url: {

                            url: `data:image/jpeg;base64,${encoded}`,

                        },

                    },

                ],

            },

        ],

        stream: true,

        max_tokens: 1000,

    });



    // stream the response

    return OpenAIStream(completion); //need to make this work

};