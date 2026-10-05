import { TeamPageContent } from "@/features/team/components/team-page"
import { teamMembers } from "@/features/team/data"

export default function TeamPage() {
  return <TeamPageContent initialMembers={teamMembers} />
}
