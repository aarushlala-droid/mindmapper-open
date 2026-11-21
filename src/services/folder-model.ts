export type MapFolder={id:string;name:string;parentId:string|null};
export type FolderCommand={type:'create';id:string;name:string;parentId:string|null}|{type:'rename';id:string;name:string}|{type:'move';id:string;parentId:string|null};
export function validateFolders(value:unknown):value is MapFolder[]{
  if(!Array.isArray(value)||value.length>2000)return false;
  const folders=new Map<string,MapFolder>();
  for(const f of value){if(!f||typeof f.id!=='string'||!f.id||f.id.length>200||folders.has(f.id)||typeof f.name!=='string'||!f.name.trim()||f.name.length>100||(f.parentId!==null&&typeof f.parentId!=='string'))return false;folders.set(f.id,f);}
  for(const f of value){const seen=new Set([f.id]);let p=f.parentId;let depth=0;while(p!==null){if(seen.has(p)||!folders.has(p)||++depth>20)return false;seen.add(p);p=folders.get(p)!.parentId;}}
  return true;
}
export function applyFolderCommand(folders:MapFolder[],command:FolderCommand):MapFolder[]{
  if(!command||!['create','rename','move'].includes(command.type)||typeof command.id!=='string'||!command.id||command.id.length>200)throw new Error('Invalid folder action.');
  if((command.type==='create'||command.type==='rename')&&typeof command.name!=='string')throw new Error('Enter a valid folder name.');
  const existing=folders.find(f=>f.id===command.id);
  let next:MapFolder[];
  if(command.type==='create'){
    if(existing){if(existing.name===command.name&&existing.parentId===command.parentId)return folders;throw new Error('This folder ID already exists.');}
    next=[...folders,{id:command.id,name:command.name?.trim(),parentId:command.parentId}];
  }else{
    if(!existing)throw new Error('This folder no longer exists. Refresh folders and try again.');
    next=folders.map(f=>f.id!==command.id?f:command.type==='rename'?{...f,name:command.name?.trim()}:{...f,parentId:command.parentId});
  }
  if(!validateFolders(next))throw new Error('Choose a valid folder name and parent. A folder cannot contain itself or one of its ancestors.');
  return next;
}
export function folderPath(folders:MapFolder[],id:string):string{
  const names:string[]=[];let folder=folders.find(f=>f.id===id);const seen=new Set<string>();
  while(folder&&!seen.has(folder.id)){seen.add(folder.id);names.unshift(folder.name);folder=folders.find(f=>f.id===folder!.parentId);}
  return names.join(' / ');
}
