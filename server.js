const express = require("express");
const app = express();
const cors = require("cors");

const fs = require("fs");

// get the client
const mysql = require("mysql2");

app.use(cors());
app.use(express.json());

// create the connection to database
const pool = mysql.createPool({
    host: "boeejsqyv4gxfs7gshhn-mysql.services.clever-cloud.com",
    user: "usutpzzu86uuzxpg",
    database: "boeejsqyv4gxfs7gshhn",
    password: "xwO5bUoK7uHoazsT9db5",
    port: "3306",

    queryFormat: function (query, values) {
        if (!values) return query;
        return query.replace(
            /\:(\w+)/g,
            function (txt, key) {
                if (values.hasOwnProperty(key)) {
                    return this.escape(values[key]);
                }
                return txt;
            }.bind(this)
        );
    },
});

const promisePool = pool.promise();

app.get("/createService", async (req, res) => {
    try {
        // const data = fs.readFileSync("./img/vk.png")

        // await promisePool.execute(
        //     "INSERT INTO `Service` (`Image`, `Title`, `Description`) VALUES (?,'Реклама Вконтакте','Текст')", [data]
        // );


    } catch (error) {
        console.log(error);
    }
});


app.get("/tablesName", async (req, res) => {
    try {
        const [names] = await promisePool.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA = 'boeejsqyv4gxfs7gshhn'");


        res.send(names).status(200);
    } catch (error) {
        console.log(error);
    }
})

app.get("/tableColumns/:name", async (req, res) => {
    try {
        const { name } = req.params;

        const [columns] = await promisePool.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ?", [name]);

        res.send(columns).status(200);
    } catch (error) {
        console.log(error);
    }
})

app.get("/tableData/:name", async (req, res) => {
    try {
        const { name } = req.params;

        const [data] = await promisePool.execute("SELECT * FROM `" + name + "`");

        res.send(data).status(200);
    } catch (error) {
        console.log(error);
    }
})

app.post("/tableAdd/:name", async (req, res) => {
    try {
        const { name } = req.params;

        let { data, columnsName } = req.body;

        columnsName = columnsName.map((name) => "`" + name + "`");
        data = data.map((value) => `'${value}'`);

        let set = " ";

        let bufferValue;

        for (let i = 0; i < columnsName.length; i++) {
            if (i + 1 < columnsName.length) {
                if (columnsName[i] === "`Image`") {
                    bufferValue = Buffer.from(data[i], "base64");
                    set += `BINARY(:bufferValue)` + ",";
                } else {
                    set += data[i] + ",";
                }
            } else {
                if (columnsName[i] === "`Image`") {
                    bufferValue = Buffer.from(data[i], "base64");
                    set += `BINARY(:bufferValue)`;
                } else {
                    set += data[i];
                }
            }
        }
        

        const query =
            "INSERT INTO " +
            name +
            "(" +
            columnsName.join(",") +
            ") VALUES(" +
            set +
            ")";

        pool.getConnection((err, connection) => {
            connection.query(query, { bufferValue }, (err, res, fields) => {
                if (err) throw err;
                pool.releaseConnection(connection);
            });
        });

        res.sendStatus(200);
    } catch (error) {
        console.log(error);
    }
})

app.listen(4000, () => {
    console.log("Server is waiting");
});
