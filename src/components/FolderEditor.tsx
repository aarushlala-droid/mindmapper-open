import {useState} from 'react';
import {Dialog} from './Dialog';
import {folderService} from '../services/folders';
import {storageService} from '../services/storage';
import {applyFolderCommand,folderPath} from '../services/folder-model';
import type {FolderEditorState} from './FolderNavigation';
export function FolderEditor({action,onDone,onClose}:{action:FolderEditorState;onDone:(folderId?:string)=>void;onClose:()=>void}){
 const folder=action.mode==='rename'||action.mode==='moveFolder'?folderService.folders.find(f=>f.id===action.id):null;
 const map=action.mode==='moveMap'?storageService.getMap(action.id):null;
 const [name,setName]=useState(folder?.name||'');
 const [parentId,setParentId]=useState(action.mode==='create'?action.parentId||'':action.mode==='moveMap'?map?.folderId||'':folder?.parentId||'');
 const [error,setError]=useState('');
 const title=action.mode==='create'?(action.parentId?'New subfolder':'New folder'):action.mode==='rename'?'Rename folder':action.mode==='moveMap'?'Move map':'Move folder';
 const destinations=folderService.folders.filter(f=>{if(action.mode!=='moveFolder')return true;try{applyFolderCommand(folderService.folders,{type:'move',id:action.id,parentId:f.id});return true;}catch{return false;}}).sort((a,b)=>folderPath(folderService.folders,a.id).localeCompare(folderPath(folderService.folders,b.id)));
 return <Dialog title={title} description={map?.title||folder?.name} onClose={onClose}><form onSubmit={e=>{e.preventDefault();try{
   if(action.mode==='create'){const id=folderService.create(name,parentId||null);onDone(id);}
   else if(action.mode==='rename'){folderService.rename(action.id,name);onDone(action.id);}
   else if(action.mode==='moveFolder'){folderService.move(action.id,parentId||null);onDone(action.id);}
   else if(map){const {folderId,...unfiled}=map;storageService.saveMap(parentId?{...map,folderId:parentId}:unfiled);onDone();}
  }catch(e){setError(e instanceof Error?e.message:'Folder action failed.');}}}>
 <div className="settings-body">{(action.mode==='create'||action.mode==='rename')&&<label className="settings-label">Folder name<input aria-label="Folder name" autoFocus maxLength={100} value={name} onChange={e=>setName(e.target.value)} required placeholder="For example: History"/></label>}
 {action.mode!=='rename'&&<label className="settings-label">{action.mode==='moveMap'?'Destination folder':'Parent folder'}<select aria-label="Destination folder" value={parentId} onChange={e=>setParentId(e.target.value)}><option value="">{action.mode==='moveMap'?'Unfiled':'Workspace root'}</option>{destinations.map(f=><option key={f.id} value={f.id}>{folderPath(folderService.folders,f.id)}</option>)}</select></label>}
 {error&&<p className="inline-feedback" role="alert">{error}</p>}</div><footer className="library-footer"><button type="button" className="text-button" onClick={onClose}>Cancel</button><button className="primary-button" type="submit">{action.mode==='create'?'Create folder':action.mode==='rename'?'Save name':'Move'}</button></footer></form></Dialog>;
}
