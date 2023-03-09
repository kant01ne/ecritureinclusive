import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRef, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import Footer from "../components/Footer";
import Github from "../components/GitHub";
import Header from "../components/Header";
import LoadingDots from "../components/LoadingDots";

const Home: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [generatedTexts, setGeneratedTexts] = useState<String>("");

  const textRef = useRef<null | HTMLDivElement>(null);

  const scrollToBios = () => {
    if (textRef.current !== null) {
      textRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const generateBio = async (e: any) => {
    e.preventDefault();
    setGeneratedTexts("");
    setLoading(true);
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: text,
      }),
    });

    debugger

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    // This data is a ReadableStream
    const data = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      console.log(chunkValue)
      setGeneratedTexts((prev) => prev + chunkValue);
    }
    scrollToBios();
    setLoading(false);
  };

  return (
    <div className="flex max-w-5xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <Head>
        <title> Generateur d'écriture inclusive</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-12 sm:mt-20">
        <a
          className="flex max-w-fit items-center justify-center space-x-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600 shadow-md transition-colors hover:bg-gray-100 mb-5"
          href="https://github.com/kant01ne/ecritureinclusive"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Github />
          <p>Star on GitHub</p>
        </a>
        <h1 className="sm:text-6xl text-4xl max-w-[708px] font-bold text-slate-900">
          Transformez vos textes avec l'écriture inclusive
        </h1>

        <h2 className="sm:text-2xl text-4xl max-w-[408px] mt-4 text-slate-600">
        Faites avancer l’égalité femmes-hommes par votre manière d’écrire.
        </h2>
        <div className="max-w-xl w-full">
          <div className="flex mt-10 items-center space-x-3">
            <Image
              src="/1-black.png"
              width={30}
              height={30}
              alt="1 icon"
              className="mb-5 sm:mb-0"
            />
            <p className="text-left font-medium">
              Copiez le texte a modifier{" "}
              <span className="text-slate-500">
                (ou écrivez directement ici)
              </span>
              .
            </p>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black my-5"
            placeholder={
              "Trouvez rapidement un médecin généraliste à Paris ou un praticien pratiquant des actes de médecine générale et prenez rendez-vous gratuitement en ligne..."
            }
          />
         
          {!loading && (
            <button
              className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full"
              onClick={(e) => generateBio(e)}
            >
              Transformer mon texte &rarr;
            </button>
          )}
          {loading && (
            <button
              className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full"
              disabled
            >
              <LoadingDots color="white" style="large" />
            </button>
          )}
        </div>
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{ duration: 2000 }}
        />
        <hr className="h-px bg-gray-700 border-1 dark:bg-gray-700" />
        <div className="space-y-10 my-10">
          {generatedTexts && (
            <>
              <div>
                <h2
                  className="sm:text-4xl text-3xl font-bold text-slate-900 mx-auto"
                  ref={textRef}
                >
                  Ton texte en écriture inclusive
                </h2>
              </div>
              <div className="space-y-8 flex flex-col items-center justify-center max-w-xl mx-auto">
                  <div
                    className="bg-white rounded-xl shadow-md p-4 hover:bg-gray-100 transition cursor-copy border"
                    onClick={() => {
                      navigator.clipboard.writeText(String(generatedTexts));
                      toast("Texte copié dans le presse papier", {
                        icon: "✂️",
                      });
                    }}
                    key={String(generatedTexts)}
                  >
                    <p>{generatedTexts}</p>
                  </div>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
