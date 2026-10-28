import{ supabase }from'../lib/supabase'
export async function uploadCrewFile(file:File,folder='general'){
 const ext=file.name.split('.').pop()||'bin'; const path=`${folder}/${crypto.randomUUID()}.${ext}`
 const{data,error}=await supabase.storage.from('kt-crew-files').upload(path,file,{upsert:false})
 return{data,error,path}
}
export async function signedCrewUrl(path:string,expires=3600){return supabase.storage.from('kt-crew-files').createSignedUrl(path,expires)}
