import './App.css'
import fionaImage from './assets/fiona.jpeg'

function App() {
  const names = {
    "Mohammad": { role: "SpringBoot Developer", image: null },
    "Andres": { role: "Backend Developer", image: null },
    "Stella": { role: "Backend Developer", image: null },
    "Fiona": { role: "Frontend Developer", image: fionaImage },
    "Honey": { role: "Frontend Developer", image: null }
  }

  return (
    <>
      <div className="container" style={{ backgroundColor: "#B4907B" }}>
        <div className="header" style={{ alignItems: "center", backgroundColor: "#5A7D8C", display: "flex", flexDirection: "row", justifyContent: "space-between", padding: "1rem" }}>
          <h1 style={{ color: "#4A3A33" }}>Style Finder</h1>
          <button style={{ backgroundColor: "#D6CCC2", borderRadius: "5px", color: "#4A3A33", fontSize: "2rem", height: "30%", padding: "0.5rem 1rem", border: "none", cursor: "pointer" }}>
            <a
              // uncomment when repo is public
              // href="https://github.com/mohammadeltawil0/Style-Finder/archive/refs/heads/main.zip" className="download-btn"
              onClick={() => console.log("Press Download Button")}
              style={{ color: "#4A3A33", textDecoration: "none" }}
            >
              Download
            </a>
          </button>
        </div>
        <div className="about-us" style={{ padding: "2rem" }}>
          <h2 style={{ color: "#4A3A33" }}>About Us</h2>
          <p style={{ color: "#4A3A33" }}>5 commmuters working together to push out Style Finder</p>
        </div>
        <div className="team" style={{ padding: "2rem" }}>
          <h2 style={{ color: "#4A3A33" }}>Meet the Team</h2>
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
            {Object.keys(names).map((name) => {
              return (
                <div key={name} className="team-member" 
                style={{ backgroundColor: "#D6CCC2", borderRadius: "10px", padding: "1.5rem", margin: "1rem", display: "flex", 
                          flexDirection: "column", alignItems: "center", textAlign: "center", width: "200px" 
                          }}>
                  {names[name].image && (
                    <img
                      src={names[name].image}
                      alt={name}
                      style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover", marginBottom: "1rem" }}
                    />
                  )}
                  <div className="team-member-info" >
                    <h3 style={{ color: "#4A3A33" }}>{name}</h3>
                    <p style={{ color: "#4A3A33", margin: -10 }}>{names[name].role}</p>
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </div>

    </>
  )
}

export default App
