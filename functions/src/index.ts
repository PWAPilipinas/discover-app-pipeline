import * as functions from 'firebase-functions';
const axios = require("axios");
const { JSDOM } = require("jsdom");

export const getAppManifest = functions.runWith({ memory: '256MB' }).https.onRequest(async (request, response) => {
   if(request.params[0].replace('/','') == '') response.status(401).json({ success: false, message: 'Site is required' });
   const site = request.params[0].replace('/','');

   let raw, dom, manifestLocation, manifest;
   let sent = false;

   try {
      raw = (await axios.get(`https://${site}`)).data
   } catch (e) {
      if(!sent) {
         response.status(501).json({ success: false, message: 'Failed to get site' });
         sent = true;
      }
   }

   try {
      dom = new JSDOM(raw);
      manifestLocation = dom.window.document.head.querySelector('link[rel="manifest"]').href;

      raw = null;
      dom = null;
   } catch(e) {
      if(!sent) {
         response.status(402).json({ success: false, message: 'Failed to find manifest' });
         sent = true;
      }
   }

   try {
      if(manifestLocation[0] === '/') {
         console.log('a');
         manifest = (await axios.get(`https://${site}${manifestLocation}`)).data;
      } else {
         console.log('b');
         manifest = (await axios.get(`https://${site}/${manifestLocation}`)).data;
      }
   } catch(e) {
      if(!sent) {
         response.status(502).json({ success: false, message: 'Failed to load manifest' });
         sent = true;
      }
   }

   if(!sent) {
      response.json(manifest || { success: false, message: 'Unknown error' });
   }
   // response.status(505).json({ success: false, message: 'Failed to send result' });
});
