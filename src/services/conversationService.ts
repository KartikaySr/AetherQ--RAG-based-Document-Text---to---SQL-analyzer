import { createClient } from "@/lib/supabase-browser";
import type { ChatMessage, ConversationWorkspaceMode } from "@/types/chat";
export type ConversationSummary = { id: string; title: string; updatedAt: Date };
export type LoadedConversation = ConversationSummary & { mode: ConversationWorkspaceMode; messages: ChatMessage[]; createdAt: Date };
const saveQueues = new Map<string, Promise<boolean>>();
const versions = new Map<string, number>();
const savedSnapshots = new Map<string, string>();
const snapshot = (messages: ChatMessage[]) => messages.filter(m => m.id !== "welcome").map(m => ({ role:m.role,content:m.content,chunks:m.chunks??null,sql_result:m.sqlResult??null }));
export const conversationService = {
  async getConversations(): Promise<ConversationSummary[]> {
    const db=createClient(); const {data:{user}}=await db.auth.getUser(); if(!user)return [];
    const {data,error}=await db.from("conversations").select("id,title,updated_at").eq("user_id",user.id).order("updated_at",{ascending:false}).limit(100);
    if(error)throw error; return (data||[]).map(r=>({id:r.id,title:r.title,updatedAt:new Date(r.updated_at)}));
  },
  async getConversation(id:string):Promise<LoadedConversation|null>{
    const db=createClient();const {data:{user}}=await db.auth.getUser();if(!user)return null;
    const {data:c,error}=await db.from("conversations").select("id,title,mode,version,created_at,updated_at").eq("id",id).eq("user_id",user.id).maybeSingle();
    if(error)throw error;if(!c)return null;
    const {data:rows,error:messageError}=await db.from("messages").select("id,role,content,chunks,sql_result,created_at").eq("conversation_id",id).order("created_at",{ascending:true}).limit(500);
    if(messageError)throw messageError;
    const messages:ChatMessage[]=(rows||[]).map(r=>({id:r.id,role:r.role,content:r.content,chunks:r.chunks||undefined,sqlResult:r.sql_result||undefined,timestamp:new Date(r.created_at)}));
    versions.set(id,c.version);savedSnapshots.set(id,JSON.stringify(snapshot(messages)));
    return {id:c.id,title:c.title,mode:c.mode,createdAt:new Date(c.created_at),updatedAt:new Date(c.updated_at),messages};
  },
  async createConversation(title:string,mode:string){
    const db=createClient();const {data:{user}}=await db.auth.getUser();if(!user)return null;
    const {data,error}=await db.from("conversations").insert({user_id:user.id,title,mode:["general","documents","analytics"].includes(mode)?mode:"general"}).select().single();
    if(error){console.error("Conversation creation failed",error.code);return null;}versions.set(data.id,data.version);savedSnapshots.set(data.id,"[]");return data;
  },
  async deleteConversation(id:string):Promise<boolean>{
    await saveQueues.get(id);const db=createClient();const {data:{user}}=await db.auth.getUser();if(!user)return false;
    const {error}=await db.from("conversations").delete().eq("id",id).eq("user_id",user.id);
    if(!error){versions.delete(id);savedSnapshots.delete(id);}return !error;
  },
  async replaceAllMessages(id:string,messages:ChatMessage[]):Promise<boolean>{
    if(id.startsWith("local-"))return false;
    const value=snapshot(messages), fingerprint=JSON.stringify(value);
    const task=(saveQueues.get(id)||Promise.resolve(true)).catch(()=>false).then(async()=>{
      if(savedSnapshots.get(id)===fingerprint)return true;
      const version=versions.get(id);if(version===undefined)return false;
      const {data,error}=await createClient().rpc("replace_conversation_messages",{p_conversation_id:id,p_messages:value,p_expected_version:version});
      if(error){console.error("Conversation save failed",error.code);return false;}
      versions.set(id,Number(data));savedSnapshots.set(id,fingerprint);return true;
    });
    saveQueues.set(id,task);try{return await task;}finally{if(saveQueues.get(id)===task)saveQueues.delete(id);}
  },
  async updateConversationTitle(id:string,title:string):Promise<boolean>{
    const db=createClient();const {data:{user}}=await db.auth.getUser();if(!user)return false;
    const {error}=await db.from("conversations").update({title,updated_at:new Date().toISOString()}).eq("id",id).eq("user_id",user.id);return !error;
  },
};
