"use client";

import Image from "next/image";
import axios from "axios";
import { useEffect, useState } from "react";

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
  const [randomImage, setRandomImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch a random animal image (cat or dog)
    const fetchRandomImage = async () => {
      try {
        const getImage =
          Math.random() > 0.5 ? getRandomCatImage : getRandomDogImage;
        const imageUrl = await getImage();
        setRandomImage(imageUrl);
      } catch (err) {
        setError("Failed to fetch the image. Please try again.");
      }
    };

    fetchRandomImage();
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 sm:p-12">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl sm:text-5xl font-bold mb-6 sm:mb-8">
          Under Construction 🚧
        </h1>
        <p className="text-lg sm:text-xl mb-4 sm:mb-6">
          Hello! I'm Daniel Gaio, a Computer Engineer graduated from the Federal
          University of Pampa (Unipampa). This personal website is currently
          under construction. I'm rebuilding it using Next.js for the frontend
          and Nest.js for the backend, all hosted on AWS.
        </p>
        <p className="text-lg sm:text-xl mb-6 sm:mb-8">
          If you'd like to connect, feel free to reach out on LinkedIn:
        </p>
        <a
          href="https://www.linkedin.com/in/daniel-gaio/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline text-lg sm:text-xl"
        >
          Connect with me on LinkedIn
        </a>
      </div>

      <div className="mt-12 sm:mt-16 flex justify-center">
        {randomImage ? (
          <Image
            src={randomImage}
            alt="A random cat or dog"
            width={300}
            height={300}
            className="rounded-lg"
          />
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </main>
  );
}
