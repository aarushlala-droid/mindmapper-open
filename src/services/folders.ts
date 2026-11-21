import {applyFolderCommand,validateFolders,type MapFolder,type FolderCommand} from './folder-model';
class FolderService{
  folders:MapFolder[]=[];status='';private key='';private ready:Promise<void>|null=null;private pending:FolderCommand[]=[];private running:Promise<boolean>|null=null;private listeners=new Set<()=>void>();
  subscribe=(fn:()=>void)=>{this.listeners.add(fn);return()=>{this.listeners.delete(fn);};};
  private emit(){this.listeners.forEach(fn=>fn());}
  private persist(){try{localStorage.setItem(this.key,JSON.stringify({folders:this.folders,pending:this.pending}));}catch{this.status='Device folder backup unavailable. Keep this tab open until folders save.';}}
  initialize(userId:string){if(this.ready)return this.ready;this.key=`mindmapper:${userId}:folders`;this.ready=this.load();return this.ready;}
  private async request(options?:RequestInit){const response=await fetch('/api/folders',{...options,cache:'no-store',signal:AbortSignal.timeout(15000)});const body=await response.json() as {folders:MapFolder[];error?:string};if(!response.ok)throw new Error(body.error||'Folders could not reach the cloud. Retry when online.');if(!validateFolders(body.folders))throw new Error('Folder data is invalid. Your maps remain available in All maps.');return body.folders;}
  private replay(base:MapFolder[]){return this.pending.reduce((folders,command)=>applyFolderCommand(folders,command),base);}
  private async load(){
    try{const cache=JSON.parse(localStorage.getItem(this.key)||'null');if(cache&&validateFolders(cache.folders)){this.folders=cache.folders;this.pending=Array.isArray(cache.pending)?cache.pending:[];}}catch{}
    try{this.folders=this.replay(await this.request());this.status='';}catch(e){this.status=e instanceof Error?e.message:'Folders unavailable.';}
    this.persist();this.emit();window.addEventListener('online',()=>void this.refresh());if(this.pending.length)void this.flush();
  }
  enqueue(command:FolderCommand){this.folders=applyFolderCommand(this.folders,command);this.pending.push(command);this.status='Saving folders…';this.persist();this.emit();void this.flush();}
  create(name:string,parentId:string|null){const id=crypto.randomUUID();this.enqueue({type:'create',id,name,parentId});return id;}
  rename(id:string,name:string){this.enqueue({type:'rename',id,name});}
  move(id:string,parentId:string|null){this.enqueue({type:'move',id,parentId});}
  flush(){if(this.running)return this.running;this.running=this.send().finally(()=>{this.running=null;});return this.running;}
  private async send(){try{while(this.pending.length){const command=this.pending[0];const saved=await this.request({method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(command)});this.pending.shift();this.folders=this.replay(saved);this.persist();this.emit();}this.status='';this.emit();return true;}catch(e){this.status=e instanceof Error?e.message:'Folders could not save. Retry.';this.persist();this.emit();return false;}}
  async refresh(){if(this.pending.length)return this.flush();try{const saved=await this.request();this.folders=this.replay(saved);this.status='';this.persist();this.emit();return true;}catch(e){this.status=e instanceof Error?e.message:'Folders unavailable.';this.emit();return false;}}
  importFolders(value:unknown){
    const mapping=new Map<string,string>();if(!validateFolders(value))return mapping;
    const pending=[...value];
    while(pending.length){const index=pending.findIndex(f=>f.parentId===null||mapping.has(f.parentId));if(index<0)break;const f=pending.splice(index,1)[0];const parentId=f.parentId?mapping.get(f.parentId)!:null;const old=this.folders.find(v=>v.id===f.id);if(old&&old.name===f.name&&old.parentId===parentId){mapping.set(f.id,f.id);continue;}
      const id=old?crypto.randomUUID():f.id;this.enqueue({type:'create',id,name:old?`${f.name.slice(0,88)} (imported)`:f.name,parentId});mapping.set(f.id,id);
    }
    return mapping;
  }
}
export const folderService=new FolderService();
