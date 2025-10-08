import jwt from "jsonwebtoken";
import "dotenv/config";

// function to generate a token for a user

export const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};