import {useState} from 'react';
import { AiOutlineSearch } from 'react-icons/ai';
import { SiGooglemaps } from 'react-icons/si'
import { toast, ToastContainer } from 'react-toastify';
import { FaLinkedin } from 'react-icons/fa';
import axios from "axios";

import "react-toastify/dist/ReactToastify.css";
import bgMap from './img/img_map.jpg';
import './style.css';

import api from './services/api';


function App() {
  const [input, setInput] = useState(''); 
  const [cep, setCep] = useState({})
  const [streetViewImage, setStreetViewImage] = useState('');
  const apiKey = "DIGITE SUA CHAVE API STREETVIEW AQUI";


  function searchMaps(cep) {
    
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cep)}`;

    window.open(mapsUrl, '_blank');
  }

  async function searchStreetViewImage(latitude, longitude) {
    const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${latitude},${longitude}&key=${apiKey}`;
    setStreetViewImage(streetViewUrl);
  }

  async function getGeocode(cep) {
    try {
      
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(cep)}&key=${apiKey}`;
      console.log(geocodeUrl);

      const response = await axios.get(geocodeUrl);

      if (response.data.results.length > 0) {
        const location = response.data.results[0].geometry.location;
        return {
          latitude: location.lat,
          longitude: location.lng
        };
      } else {
        throw new Error("Endereço não encontrado.");
      }
    } catch (error) {
      throw new Error("Erro ao obter as coordenadas geográficas.");
    }
  }


  async function handleSearch() {
    if(input === '') {
      toast.warn('Campo Vazio, Insira um CEP', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      
      return false;
    }

    try{
      const resolveAfter3Sec = new Promise(resolve => setTimeout(resolve, 3000));
      const response = await api.get(`${input}/json`)
      toast.promise(
        resolveAfter3Sec,
        {
          pending: 'Procurando Dados',
        }
      )
      setCep(response.data);


      const { latitude, longitude } = await getGeocode(response.data.logradouro);

      if (latitude && longitude) {
        searchStreetViewImage(latitude, longitude); 
      }
      

      setInput('');
    }
     catch (error) {
      toast.error(`Erro ao realizar a consulta: ${error.message}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      setInput('');
    }

  }

  return (
    <div className="container" style={{ backgroundImage: `url( ${bgMap} )` }}>
      <ToastContainer />
      <h1 className="title">Pesquisador de CEP</h1>

      <div className="containerInput">
        
        <input
          type="text"
          placeholder="Digite um Cep"
          id="myButton"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          required
        />


        <button className="buttonSearch" onClick={() => handleSearch()}>
          <AiOutlineSearch size={24} color="#000" />
        </button>

        
      </div>

    {Object.keys(cep).length > 0 && (
        <main className='main'>
          <h2>CEP: {cep.cep}</h2>

          {cep.logradouro && <span>Rua: {cep.logradouro}</span>}
          {cep.complemento && <span>Complemento: {cep.complemento}</span>}
          {cep.bairro && <span>Bairro: {cep.bairro}</span>}
          {cep.localidade && <span>{cep.localidade} - {cep.uf}</span>}
          {cep.ddd && <span>DDD: ({cep.ddd})</span>}

          <div className='streetView'>
            <h3>Google Street View</h3>
            <img src={streetViewImage} alt="Street View" />
          </div>
          <button className='buttonMaps' onClick={() => searchMaps(cep.cep)}>Navegar <SiGooglemaps size={20} color='#DD4B3E' /></button>


        </main>


    )}

      <footer className="footer">
        <div className="footer-content">
          <p>Leonardo Soldi</p>
          <a href="www.linkedin.com/in/leonardo-soldi-b47198141" target="_blank" rel="noopener noreferrer">
            <FaLinkedin size={24} />
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
