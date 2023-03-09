import { DustTTStream } from "../../utils/DustTTStream";

if (!process.env.DUST_API_KEY) {
  throw new Error("Missing env var from Dust");
}

export const config = {
  runtime: "edge",
};

const handler = async (req: Request): Promise<Response> => {
  const { prompt } = (await req.json()) as {
    prompt?: string;
  };

  if (!prompt) {
    return new Response("No prompt in the request", { status: 400 });
  }

  const stream = await DustTTStream(prompt);
  return new Response(stream);
};

export default handler;

