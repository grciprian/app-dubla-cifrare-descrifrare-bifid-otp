# app-dubla-cifrare-descrifrare-bifid-otp

## Cerinte preliminare
[Descarca si instaleaza NodeJS](https://nodejs.org/en/download/)

`Comenzile urmatoare se executa din CMD in interiorul directorului proiectului clonat`

## Dezvoltare
Dupa ce se cloneaza local proiectul, se executa
```
npm install
npm run
```

## Impachetare
Se instaleaza global `electron-packager` folosind npm
```
npm i -g electron-packager
```
Se impacheteaza(pentru Windows) efectiv prin
```
electron-packager . AppDublaCifrareDescifrareBifidOTP --platform=win32 --arch=x64
```
