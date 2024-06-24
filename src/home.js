const Home = () => {
    const containerStyle = {
        textAlign: "center",
        fontFamily: "PT Mono, monospace",
        fontStyle: "italic",
        margin: 0,
        padding: 0,
        display: "grid",
        placeItems: "center",
        justifyContent: "center",
        height: "95vh",
        backgroundColor: "#f4f4f4",
    };
    const footerStyle = {
        marginTop: "auto",
        padding: "10px 0",
        color: "#999",
        fontSize: "0.9em",
    };
    const linkStyle = {
        color: "inherit",
        textDecoration: "none",
    };
    return (
        <div style={containerStyle}>
            <div>
                <h1 style={{ "fontWeight": "lighter", margin: 0, fontSize: "3em" }}>Coming Soon...</h1>
            </div>
            <footer style={footerStyle}>
                <a style={linkStyle} href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">浙ICP备2024104088号</a>
            </footer>
        </div>
    );
}

export default Home;