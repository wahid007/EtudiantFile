export interface Course {
  id: string;          // Unique identifier
  name: string;
  description: string;
  duration: string;      // e.g., "10 hours", "3 weeks"
  price: number;
  topic: string;         // e.g., "Web Development", "Data Science", "Cybersecurity"
  difficulty: "Beginner" | "Intermediate" | "Advanced"; // String literal type
}
