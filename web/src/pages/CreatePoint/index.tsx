import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';

import Dropzone from '../../components/Dropzone';
import api from '../../service/api';
import logo from '../../assets/logo.svg';
import './styles.css';

interface ItemsProps {
  id: number;
  title: string;
  image_url: string;
}

interface UFsProps {
  id: number;
  sigla: string;
}

interface CitiesProps {
  id: number;
  nome: string;
}

const CreatePoint = () => {
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [initialPosition, setInitialPosition] = useState<[number, number]>([0,0]);
  const [items, setItems] = useState<ItemsProps[]>([]);
  const [ufs, setUfs] = useState<UFsProps[]>([]);
  const [selectedUf, setSelectedUf] = useState('');
  const [cities, setCities] = useState<CitiesProps[]>([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0,0]);
  const [inputsData, setInputsData] = useState({
    name: '',
    email: '',
    whatsapp: '',
  });

  const [selectedFile, setSelectedFile] = useState<File>();
  const history = useHistory();
  
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      
      setInitialPosition([latitude, longitude]);
      setSelectedPosition([latitude, longitude]);
    });
  }, []);
  

  useEffect(() => {
    api.get('/items')
      .then(response => {
        setItems(response.data);
      })
      .catch(error => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    api.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
      .then(response => {
        setUfs(response.data);
      })
      .catch(error => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    if (selectedUf) {
      api.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios
      `)
        .then(response => {
          setCities(response.data);
        })
        .catch(error => console.log(error));
    }
  }, [selectedUf])

  const handleSelectChangeUf = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
     setSelectedUf(event.target.value);
  }, []);

  const handleSelectChangeCity = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(event.target.value);
  }, []);

  const handleClickMap = useCallback((event: LeafletMouseEvent) => {
    const { lat, lng } = event.latlng;

    setSelectedPosition([lat, lng]);
  }, [])

  const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setInputsData({ ...inputsData, [name]: value });
  }, [inputsData]);

  const handleSelectItem = useCallback((id: number) => {
    const checkItem = selectedItems.includes(id);
    
    if (checkItem) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }

  }, [selectedItems]);

  const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { name, email, whatsapp } = inputsData;
    const uf = selectedUf;
    const city = selectedCity;
    const [latitude, longitude] = selectedPosition;
    const items = selectedItems;

    const data = new FormData();

    data.append('name', name);
    data.append('email', email);
    data.append('whatsapp', whatsapp);
    data.append('city', city);
    data.append('uf', uf);
    data.append('latitude', String(latitude));
    data.append('longitude', String(longitude));
    data.append('items', items.join(','));

    if (selectedFile) {
      data.append('image', selectedFile);
    }

    await api.post('/points', data);

    window.alert('Entidade cadastrada com sucesso!');
    history.push('/');
  }, [history, inputsData, selectedCity, selectedFile, selectedItems, selectedPosition, selectedUf]);

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta"/>
        <Link to="/">
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>

      <form autoComplete="off" onSubmit={handleSubmit}>
        <h1>Cadastro do <br/> ponto de coleta</h1>

        <Dropzone onFileUploaded={setSelectedFile} />

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field"> 
            <label htmlFor="name">Nome da entidade</label>
            <input 
              type="text"
              name="name"
              id="name"
              onChange={handleInputChange}
            />
          </div>

          <div className="field-group">
            <div className="field"> 
              <label htmlFor="email">E-mail</label>
              <input 
                type="email"
                name="email"
                id="email"
                onChange={handleInputChange}
              />
            </div>
            <div className="field"> 
              <label htmlFor="whatsapp">Whatsapp</label>
              <input 
                type="text"
                name="whatsapp"
                id="whatsapp"
                onChange={handleInputChange}
            />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione um endereço no mapa</span>
          </legend>
          <Map center={initialPosition} zoom={15} onClick={handleClickMap}>
            <TileLayer 
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker 
              position={selectedPosition}
            />
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">UF</label>
              <select 
                onChange={handleSelectChangeUf} 
                name="uf" 
                id="uf"
                value={selectedUf}
              >
                <option value="">Selecione um Estado</option>
                {ufs.map(uf => (
                  <option key={uf.id} value={uf.sigla}>{uf.sigla}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select 
                onChange={handleSelectChangeCity} 
                name="city" 
                id="city"
                value={selectedCity}
              >
                <option value="">Selecione uma cidade</option>
                {cities.map(city => (
                  <option key={city.id} value={city.nome}>{city.nome}</option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>


        <fieldset>
          <legend>
            <h2>Ítens de coleta</h2>
            <span>Selecione um ou mais itens abaixo</span>
          </legend>

          <ul className="items-grid">
            {items.map(item => (
              <li 
              key={item.id} 
              onClick={() => handleSelectItem(item.id)}
              className={selectedItems.includes(item.id) ? 'selected' : ''}
              >
                <img src={item.image_url} alt={item.title}/>
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </fieldset>

        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div>  
  );
}

export default CreatePoint;