"use client";

import Image from "next/image";
import axios from "axios";
import { useEffect, useState } from "react";
import DrawerAppBar from "./nav";
import Layout from "./layout";

// Function to get a random cat image
const getRandomCatImage = async () => {
  try {
    const response = await axios.get(
      "https://api.thecatapi.com/v1/images/search"
    );
    return (response.data as any)[0].url;
  } catch (error) {
    console.error("Error fetching random cat image:", error);
    return null;
  }
};

// Function to get a random dog image
const getRandomDogImage = async () => {
  try {
    const response = await axios.get("https://dog.ceo/api/breeds/image/random");
    return (response.data as any).message;
  } catch (error) {
    console.error("Error fetching random dog image:", error);
    return null;
  }
};

// Main component
export default function Home() {
  const [randomImage, setRandomImage] = useState(null);

  useEffect(() => {
    // Randomly decide whether to fetch a cat or dog image
    const fetchRandomImage =
      Math.random() > 0.5 ? getRandomCatImage : getRandomDogImage;
    fetchRandomImage().then(setRandomImage);
  }, []);

  return (
    <>
      <Layout>
        <DrawerAppBar />

        <main className="flex min-h-screen flex-col items-center justify-center p-24">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-8">Under Construction 🚧</h1>
            <p className="text-xl mb-6">
              Hello! I'm Daniel Gaio, a Computer Engineer graduated from the
              Federal University of Pampa (Unipampa). Currently, this personal
              website is under construction. I'm rebuilding it with a modern
              client-server architecture using Next.js for the frontend and
              Nest.js for the backend, all hosted on AWS.
            </p>
            <p className="text-xl mb-8">
              If you'd like to get in touch with me, feel free to connect with
              me on LinkedIn by clicking the link below:
            </p>
            <a
              href="https://www.linkedin.com/in/daniel-gaio/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline text-xl"
            >
              Connect with me on LinkedIn
            </a>
          </div>

          <div className="mt-16 flex justify-center">
            {randomImage ? (
              <Image
                src={randomImage}
                alt="Random Animal Image"
                width={300}
                height={300}
              />
            ) : (
              <p>Loading...</p>
            )}
          </div>
        </main>
      </Layout>
    </>
  );
}
