/*
 *   1.Goto root path of the folder and run in commant line : npm install --save(This will install all the required modules mentioned in package.json file)
 *   2. First app.js file loads 
 *   2.When we run node app.js file first we are getting DB pool connection and storing in cache memory(File present in service/dbPool/dbPoolLoadInit.js)
 *      From  dbPoolLoadInit.js file we are loading (helper/connectionInitialize.js) to connect to DB and then adding that connection to poolcluster with some name.
 *      and that poolcluster is stored in cache.
 *      SO WHEN app.js loads we will get pool Connection
 * 
 * 
 * **/


