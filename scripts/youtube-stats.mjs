import { writeFile } from 'node:fs/promises';
const handle='JLXGAMINGYT', key=process.env.YOUTUBE_API_KEY;
const base={source:'YouTube Data API v3',handle:'@'+handle,channelUrl:'https://www.youtube.com/@'+handle,updatedAt:new Date().toISOString()};
async function api(path,params={}){const u=new URL('https://www.googleapis.com/youtube/v3/'+path);for(const [k,v] of Object.entries({...params,key}))if(v!=null)u.searchParams.set(k,v);const r=await fetch(u);const j=await r.json();if(!r.ok)throw Error(j.error?.message||'YouTube API error '+r.status);return j}
let data={...base,status:'missing_key',message:'Add YOUTUBE_API_KEY under repository Settings → Secrets and variables → Actions.'};
if(key){try{
 const c=(await api('channels',{part:'snippet,statistics,contentDetails',forHandle:handle})).items?.[0];if(!c)throw Error('Channel @'+handle+' was not found.');
 const s=c.statistics||{}, uploads=c.contentDetails?.relatedPlaylists?.uploads;
 data={...base,status:'ok',channel:{id:c.id,title:c.snippet?.title,subscribers:s.hiddenSubscriberCount?null:Number(s.subscriberCount||0),subscribersHidden:!!s.hiddenSubscriberCount,totalViews:Number(s.viewCount||0),videoCount:Number(s.videoCount||0)},live:{isLive:false,viewers:null},latestVideo:null};
 if(uploads){const p=await api('playlistItems',{part:'contentDetails',playlistId:uploads,maxResults:1});const id=p.items?.[0]?.contentDetails?.videoId;if(id){const v=(await api('videos',{part:'snippet,statistics',id})).items?.[0];if(v)data.latestVideo={id,title:v.snippet?.title,publishedAt:v.snippet?.publishedAt,views:Number(v.statistics?.viewCount||0),likes:v.statistics?.likeCount==null?null:Number(v.statistics.likeCount),url:'https://www.youtube.com/watch?v='+id}}}
 const q=(await api('search',{part:'id',channelId:c.id,eventType:'live',type:'video',maxResults:1})).items?.[0]?.id?.videoId;
 if(q){const v=(await api('videos',{part:'snippet,liveStreamingDetails',id:q})).items?.[0];data.live={isLive:true,viewers:v?.liveStreamingDetails?.concurrentViewers==null?null:Number(v.liveStreamingDetails.concurrentViewers),title:v?.snippet?.title,url:'https://www.youtube.com/watch?v='+q}}
 }catch(e){data={...base,status:'error',message:e.message};console.error(e.message);process.exitCode=1}}
await writeFile(new URL('../data/youtube.json',import.meta.url),JSON.stringify(data,null,2)+'\n');console.log('YouTube stats:',data.status);
