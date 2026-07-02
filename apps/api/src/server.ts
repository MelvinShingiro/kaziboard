import app from "./app";

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
        console.log(`Kaziboard API is running on port ${PORT}`);
})