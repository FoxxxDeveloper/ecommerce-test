import '../../css/Clientes/FooterCliente.css';

const FooterCliente = () => {
  return (
    <footer>
        <div id="containerFooter2">
            <div id="webFooter2">
                <h3>Atención al cliente</h3>
                <p>Lunes a Viernes</p>
                <p>De 09:00hs hasta 18:00hs</p>
                <p>Sábados</p>
                <p>De 10:00hs hasta 13:00hs</p>
            </div>
            <div id="webFooter2">
                <h3>INFORMACION</h3>
                <p 
                    onClick={() => window.location.href = '/sobrenosotros'}
                >
                    FAQ
                </p>
            </div>
            <div id="webFooter2">
                <h3>Contacto</h3>
                <a 
                    href="https://api.whatsapp.com/send?phone=5493814031834&text=!Hola%20Alejandro!%20Vengo%20de%20la%20pagina%20de%20FoxSoftware%20y%20me%20gustaria%20mas%20informacion%20acerca%20de%20los%20sistemas%20informaticos."
                    target="_blank" 
                    rel="noopener noreferrer"
                >
                    +54 3814031834
                </a>
                <p>foxdeveloper0@gmail.com</p>
            </div>
            <div id="webFooter2">
                <h3>Redes sociales</h3>
                <a 
    href="https://www.instagram.com/foxsoftware_/" 
    target="_blank" 
    rel="noopener noreferrer"
    aria-label="Instagram"
>
    <img 
        style={{ width: '50px' }} 
        src="https://cdn.icon-icons.com/icons2/2992/PNG/512/instagram_logo_icon_187313.png" 
        alt="Instagram logo"
    />
</a>

                <a 
                    href="https://www.youtube.com/@FOXDeveloper-zo2dl/videos" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                >
                    <img 
                        style={{ width: '60px' }} 
                        src="https://static.vecteezy.com/system/resources/thumbnails/023/986/480/small_2x/youtube-logo-youtube-logo-transparent-youtube-icon-transparent-free-free-png.png" 
                        alt="YouTube logo"
                    />
                </a>
            </div>
        </div>
        <div id="footer2">
            <div className="footer-container2">
                <p className="footer-text2">
                    <a href="https://www.instagram.com/foxsoftware_/" target="_blank" rel="noopener noreferrer">
                        © {new Date().getFullYear()} FoxSoftware
                    </a>
                    &nbsp;|&nbsp;
                    <a 
                        href="https://api.whatsapp.com/send?phone=5493814031834&text=!Hola%20Alejandro!%20Vi%20tu%20p%C3%A1gina%20web%20y%20me%20gustar%C3%ADa%20una%20similar." 
                        target="_blank" 
                        rel="noopener noreferrer"
                    >
                        Whatsapp
                    </a>
                </p>
            </div>
            <br />
        </div>
    </footer>
  );
};

export default FooterCliente;
