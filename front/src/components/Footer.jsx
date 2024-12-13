import '../css/Footer.css';

const Footer = () => {
  return (
    <div id="footer">
      <div className="footer-container">
        <p className="footer-text">
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
    </div>
  );
};

export default Footer;
