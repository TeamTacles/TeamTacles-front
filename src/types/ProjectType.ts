import { Member } from "../components/TeamCard";

export type ProjectType = {
  id: string;
  title: string;
  description: string;
  lastUpdated: number;
  teamMembers: Member[];
};