MERN CO-PO Classifier (Option C) - Exact UI converted to MERN

How to run (local):

1) Server
   cd server
   npm install
   # optionally set MONGO_URI in server/.env to enable history persistence
   npm start

2) Client
   cd client
   npm install
   npm start

Notes:
- Server exposes /api/classify and /api/history
- If you set MONGO_URI in server/.env and have MongoDB running, history will persist.
