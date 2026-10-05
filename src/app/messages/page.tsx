import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ConversationRepository } from "@/repositories/conversation.repository";
import { MessagesClient } from "./MessagesClient";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const conversations = await ConversationRepository.findUserConversations(session.id);

  return <MessagesClient currentUser={session} initialConversations={conversations} />;
}
