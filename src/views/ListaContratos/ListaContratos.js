import React, { useState, useEffect } from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
// nodejs library that concatenates classes
import classNames from "classnames";
// core components
import Header from "components/Header/Header.js";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Button from "components/CustomButtons/Button.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import CardAvatar from "components/Card/CardAvatar.js";
import Parallax from "components/Parallax/Parallax.js";
import Footer from "components/Footer/Footer.js";
import Table from "views/ListaContratos/Table/Table.js";
// sections for this page
import HeaderLinksHome from "components/Header/HeaderLinksHome.js";

import styles from "assets/jss/material-kit-react/views/components.js";
import Spinner from 'views/Loading/Spinner';

import ReactStars from "react-rating-stars-component";
//AWS
import Amplify, { Auth, API } from "aws-amplify";
//React Router
import { useHistory } from "react-router-dom"

const styles2 = {
    cardCategoryWhite: {
      "&,& a,& a:hover,& a:focus": {
        color: "rgba(255,255,255,.62)",
        margin: "0",
        fontSize: "14px",
        marginTop: "0",
        marginBottom: "0"
      },
      "& a,& a:hover,& a:focus": {
        color: "#FFFFFF"
      }
    },
    cardTitleWhite: {
      color: "#FFFFFF",
      marginTop: "0px",
      minHeight: "auto",
      fontWeight: "300",
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      marginBottom: "3px",
      textDecoration: "none",
      "& small": {
        color: "#777",
        fontSize: "65%",
        fontWeight: "400",
        lineHeight: "1"
      }
    }
  };
const useStyles = makeStyles(styles, styles2);

export default function ListaContratos(props) {
    const classes = useStyles();//routing con programacion sin Link
    const {checkUser, signOut} = props;
    const history = useHistory();
    const [datosContratados, setDatosContratados] = useState([])
    const [listaRenderizar, setListaRenderizar] = useState([]);
    const [calificacion, setCalificacion] = useState();
    const [loading, setLoading] = useState(false);

    useEffect(  () => {
        getUserContract()
    }, [])

    const getUserContract = async () => {

        setLoading(true)

        let path = "/pruebacontratos";
        const apiName = "pruebacontrato";
        
        let contratosLista = await API.get(apiName, path);
        try{
            console.log("Data",contratosLista)
        }catch(err){
            console.log("Houston Problemas en contratosLista", err)
        }

        let currentEmpleador = await Auth.currentAuthenticatedUser();
        let user = { username: currentEmpleador.username, id_empleador: currentEmpleador.attributes.sub }
        
        let contratosEmpleador = []

        contratosLista.map( (empleadors) => {
            if(empleadors.id_empleador === user.id_empleador){
                contratosEmpleador.push(empleadors)
            }
        })

        let contratados = []
        
        for ( let contratado of contratosEmpleador) {
            let path =  `/user/${contratado.id_trabajador}`;
            const apiName = "pruebatesis";
            const datosTrabajador  = await API.get(apiName, path);
            
            datosTrabajador.forEach( (objetoTrab) => {
                objetoTrab.id_contrato = contratado.id_contrato
                objetoTrab.fecha_contratacion = contratado.fecha_contratacion
                objetoTrab.calificacion = contratado.calificacion
            })
            contratados.push(datosTrabajador);
            console.log("Datos TRABAJADOR CONTRATADO", contratados)
        }

        setDatosContratados(contratados)

        let listaAux = []
        contratados.forEach( (trab) => {
            trab.forEach( (traba) => {
                listaAux.push([`${traba.firstName} ${traba.lastName}`, traba.categoria, traba.trabajo, traba.fecha_contratacion, traba.calificacion ? <ReactStars
                size={25}
                count={5}
                value={+traba.calificacion}
               /*  onChange={ratingChanged} */
                color2={"#ffd700"}
            /> : <Button color="sucess" onClick={() => handlePerfil(traba.user_id, traba.user.username, traba.id_contrato)}>Calificar</Button> ])
            } ) 
        } )

        console.log("Lista Aux", listaAux)
        setListaRenderizar(listaAux)
        console.log("LISTA RENDERIZAR XD",listaRenderizar)
        
        setLoading(false)
        
    }

    const handlePerfil = (id_trabajador, username, id_contrato) => {
        console.log("Id Usuario", id_trabajador)
        /* history.push(`/contrato/${id_trabajador}`) */
        history.push({pathname: "/contrato",
                        state:{ id_trabajador: id_trabajador,
                                username: username,
                                id_contrato: id_contrato}, })
        }

    return (
        <div>
            <Header
                    brand="Proyecto Titulación"
                    rightLinks={
                        <HeaderLinksHome
                            checkUser={checkUser}
                            signOut={signOut}
                        />
                    }
                    fixed
                    color="dark"
                    changeColorOnScroll={{
                    height: 400,
                    color: "white"
                    }}
                    //{...rest}
            />

            <Parallax image={require("assets/img/lista-contratos.png")}>
                <div className={classes.container}>
                <GridContainer>
                    <GridItem>
                    <div className={classes.brand}>
                        <h1 className={classes.title}>Lista Contratos</h1>
                        <h3 className={classes.subtitle}>
                            Lista de Trabajadores Contratados
                        </h3>
                    </div>
                    </GridItem>
                </GridContainer>
                </div>
            </Parallax>

           {/*  <ReactStars
                size={100}
                count={5}
                onChange={ratingChanged}
                color2={"#ffd700"}
            /> */}

               {/*  <ReactStars
                    size={100}
                    onChange={ratingChanged}
                    emptyIcon={<i className="far fa-star" />}
                    halfIcon={<i className="fa fa-star-half-alt" />}
                    filledIcon={<i className="fa fa-star" />}
                /> */}
                    
            {loading ? <Spinner/> : <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                    <Card>
                    <CardHeader color="success">
                        <h4 className={classes.cardTitleWhite}>Trabajadores Contratados</h4>
                        <p className={classes.cardCategoryWhite}>
                        </p>
                    </CardHeader>
                    <CardBody>
                        <Table
                        tableHeaderColor="success"
                        tableHead={["Trabajador", "Categoría", "Trabajo", "Fecha Contrato", "Calificacion"]}
                        tableData={listaRenderizar}
                        calificacion={calificacion}
                        datosContratados={datosContratados}
                        />
                    </CardBody>
                    </Card>
                </GridItem>
            </GridContainer>}
            <Footer />
        </div>
    );
}