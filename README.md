# Kutyaval egy mosolyért admin oldal
Csak Firebase Angular alkalmazás

Az Angular alkalmazás telepítése
`ng deploy`

## Clud functions local testing
Go to the functions directory.

```
set GOOGLE_APPLICATION_CREDENTIALS=kegym_auth_key.json
npm run shell
```

Upload new function
```
firebase deploy --only functions
```

## Exporting data from firebase firestore

Open cloud console 
https://console.cloud.google.com/home/dashboard?project=kutyavalegymosolyert-admin&cloudshell=true

```
gcloud config set project kutyavalegymosolyert-admin
gcloud firestore export gs://kutyavalegymosolyert-admin.appspot.com/backups/$(date +%Y%m%d)
```
