const express = require("express");
const app = express();
const cors = require("cors");
const hbs = require("hbs");
const dateTime = require('node-datetime');

const fs = require("fs");

// get the client
const mysql = require("mysql2");

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + '/public'));

app.set("view engine", "hbs");
hbs.registerPartials(__dirname + "/views/partials/");

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


hbs.registerHelper("ifEquals", (arg1, arg2, options) => {

    return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
})

app.get("/services", async (req, res) => {

    const [service] = await promisePool.execute("SELECT * FROM `Service`");

    for (let i = 0; i < service.length; i++) {
        if (service[i]?.Image) {
            service[i].Image = "data:image/png;base64," + Buffer.from(service[i].Image).toString("base64")
        }
    }

    res.render("services.hbs", {
        service
    })
})



app.get("/profile/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (id === "null") {
            res.redirect("/registration")
        } else {
            const [user] = await promisePool.execute("SELECT * FROM `User` WHERE `Email` = ?", [id]);
            const [order] = await promisePool.execute("SELECT * FROM `Order` WHERE `idUser` = ?", [user[0].idUser]);
            const services = [];
            for (let i = 0; i < order.length; i++) {
                const [service] = await promisePool.execute("SELECT * FROM `Service` WHERE `idService` = ?", [order[i].idService]);

                if (service[0]?.Image) {
                    service[0].Image = "data:image/png;base64," + Buffer.from(service[0].Image).toString("base64")
                }

                const date = new Date(order[i].date)
                const formatted = new Intl.DateTimeFormat('en-US').format(date);
                const serviceObject = {
                    image: service[0].Image,
                    title: service[0].Title,
                    date: formatted,
                    status: order[i].status
                }

                services.push(
                    serviceObject
                )

            }
            res.render("profile.hbs", {
                user,
                services

            })


        }


    } catch (error) {
        console.log(error);
    }
})

app.get("/registration", async (req, res) => {
    try {
        res.render("registration.hbs");
    } catch (error) {
        console.log(error);
    }
})

app.get("/login", async (req, res) => {
    try {

        res.render("login.hbs")

    } catch (error) {
        console.log(error);
    }
})

app.get("/service/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [service] = await promisePool.execute("SELECT * FROM `Service` WHERE idService = ?", [id]);

        for (let i = 0; i < service.length; i++) {
            if (service[i]?.Image) {
                service[i].Image = "data:image/png;base64," + Buffer.from(service[i].Image).toString("base64")
            }
        }

        res.render("service.hbs", {
            service
        })
    } catch (error) {

    }

})

app.post("/createOrder", async (req, res) => {
    try {
        const { name, email, idOrder } = req.body;

        var dt = dateTime.create();
        var formatted = dt.format('Y-m-d H:M:S');

        const [duplicateUser] = await promisePool.execute("SELECT * FROM `User` WHERE `Email` = ?", [email]);

        if (duplicateUser.length === 0) {
            const [user] = await promisePool.execute("INSERT INTO `User` (`Name`, `Email`) VALUES(?,?)", [name, email]);
            const [order] = await promisePool.execute("INSERT INTO `Order` (`idUser`, `idService`, `date`, `status`) VALUES (?,?,?,?)", [user.insertId, idOrder, formatted, "новый"])
        } else {
            const [order] = await promisePool.execute("INSERT INTO `Order` (`idUser`, `idService`, `date`, `status`) VALUES (?,?,?,?)", [duplicateUser[0].idUser, idOrder, formatted, "новый"])
        }


        res.sendStatus(200);
    } catch (error) {
        console.log(error);
    }
})

app.post("/createUser", async (req, res) => {
    try {
        const { login, email, password } = req.body;

        const [duplicateUser] = await promisePool.execute("SELECT * FROM `User` WHERE `Email` = ?", [email]);

        if (duplicateUser.length === 0) {
            const [user] = await promisePool.execute("INSERT INTO `User` (`Name`, `Email`, `Password`) VALUES (?,?,?)", [login, email, password]);
            console.log(user);
            res.sendStatus(200);
        }
        else {
            res.render(500);
        }
    } catch (error) {

    }
});

app.post("/enterUser", async (req, res) => {
    try {
        const { email, password } = req.body;

        const [user] = await promisePool.execute("SELECT * FROM `User` WHERE Email = ?", [email]);
        if (user.length > 0) {

            res.sendStatus(200);
        }
    } catch (error) {

    }
})

//template
app.get("/tablesName", async (req, res) => {
    try {
        const [names] = await promisePool.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA = 'boeejsqyv4gxfs7gshhn'");

        res.render("admin.hbs", {
            names
        });
    } catch (error) {

    }
});

app.get("/tableColumns/:name", async (req, res) => {
    try {
        const { name } = req.params;

        const [columns] = await promisePool.execute("SELECT COLUMN_NAME, COLUMN_KEY, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ?", [name]);

        const [data] = await promisePool.execute("SELECT * FROM `" + name + "`");


        for (let i = 0; i < data.length; i++) {
            if (data[i]?.Image) {
                data[i].Image = "data:image/png;base64," + Buffer.from(data[i].Image).toString("base64")
            }
        }

        // console.log(columns);

        const colum = columns.map((column) => column.COLUMN_NAME);
        const primaryKey = columns.find((colum) => { if (colum.COLUMN_KEY === 'PRI') { return colum } }).COLUMN_NAME

        res.render("table.hbs", {
            columns: colum,
            columnsDataType: columns,
            data: data,
            tableName: name,
            primaryKey
        });
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
            "INSERT INTO `" +
            name +
            "`(" +
            columnsName.join(",") +
            ") VALUES(" +
            set +
            ")";
        // await promisePool.execute(query);
        pool.getConnection((err, connection) => {
            connection.query(query, { bufferValue }, (err, respond, fields) => {
                if (!respond) {
                    res.sendStatus(304);

                } else {
                    res.sendStatus(200);
                }
                pool.releaseConnection(connection);
            });
        });

    } catch (error) {
        console.log(error);
    }
})

app.post("/tableChangeData/:name", async (req, res) => {
    try {
        const { name } = req.params;

        let { columnsName, data, field, id } = req.body;

        columnsName = columnsName.map((name) => "`" + name + "`");
        data = data.map((value) => `'${value}'`);

        let set = " SET ";

        let bufferValue;

        for (let i = 0; i < columnsName.length; i++) {
            if (i + 1 < columnsName.length) {
                if (columnsName[i] === "`Image`") {
                    bufferValue = Buffer.from(data[i], "base64");
                    set += columnsName[i] + "=" + `BINARY(:bufferValue)` + ",";
                } else {
                    set += columnsName[i] + "=" + data[i] + ",";
                }
            } else {
                if (columnsName[i] === "`Image`") {
                    bufferValue = Buffer.from(data[i], "base64");
                    set += columnsName[i] + "=" + `BINARY(:bufferValue)`;
                } else {
                    set += columnsName[i] + "=" + data[i];
                }
            }
        }

        const query =
            "UPDATE `" +
            name + "`" +
            set +
            " WHERE " +
            "`" +
            `${field}` +
            "`" +
            "=" +
            `'${id}'`;
        pool.getConnection((err, connection) => {
            connection.query(query, { bufferValue }, (err, respond, fields) => {
                if (err) throw err;
                if (respond.affectedRows === 0) {
                    res.sendStatus(404)
                } else {
                    res.sendStatus(200);
                }
                pool.releaseConnection(connection);
            });
        });

    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
});

app.post("/tableDeleteData/:name", async (req, res) => {
    try {
        const { name } = req.params;

        const { field, id } = req.body;

        const query =
            "DELETE FROM `" +
            name +
            "` WHERE " +
            "`" +
            `${field}` +
            "`" +
            "=" +
            `${id}`;
        pool.getConnection((err, connection) => {
            connection.query(query, (err, respond, fields) => {
                if (err) {
                    // console.log(err);
                    res.sendStatus(304);
                } else {
                    res.sendStatus(200);
                }
                pool.releaseConnection(connection);
            });
        });

    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
});

app.listen(4000, () => {
    console.log("Server is waiting");
});
