import Head from "next/head";
import axios from "axios";
import jwt from "jsonwebtoken";
import user from "../models/user.js";
import Header from "../components/Header.partial";
import dbConnect from "../utils/dbConnect.js";
import { createRef, useState } from "react";
import Modal from 'react-modal';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

export async function getServerSideProps(context) {
    // Default auth to false
    let auth = false;

    // check token and verify valid user
    if (!context.req.headers.cookie) {
        return {
            props: {
                auth,
            },
        };
    } else {
        const db = await dbConnect();
        const jwtUser = jwt.verify(
            context.req.headers.cookie.split("=")[1],
            process.env.JWTSECRET
        );
        const foundUser = await user.findOne({ id: jwtUser.userId });
        console.log("Found User", foundUser);
        if (foundUser) {
            return {
                props: { auth: true }, // Will be passed to the page component as props
            };
        } else {
            var res = context.res;
            res.statusCode = 302;
            res.setHeader("Location", `/auth`); // Replace <link> with your url link
            return { props: {} };
        }
    }
}

export default (props) => {
    const titleRef = createRef();
    const thumbRef:React.RefObject<HTMLInputElement> = createRef();
    const tagsRef:React.RefObject<HTMLInputElement> = createRef();
    const bodyRef = createRef();
    
    const [suggestedTag,setSuggestedTag] = useState('React');
    const [tags,setTags] = useState([]);
    const [suggested,setSuggested] = useState('');
    const [modalIsOpen,setModalIsOpen] =useState(false);
    const [crop,setCrop] = useState({height:0,width:0});
    const [imageSrc,setImageSrc] = useState('');
    
    const handleUpload = () => {

    }
    const handleKeyPress  = (e) => {
        if (e.which == 13 && suggested && tags.length <= 10){
            setTags(tags.concat(suggested));
            tagsRef.current.value = '';
            setSuggested('');
        }
    }
    const handleTagInputChange = (e) => {
        if (e.target.value === suggestedTag.slice(0,e.target.value.length)){
            setSuggested(suggestedTag);
        }
        if (e.target.value === ''){
            setSuggested('');
        }
    }
    const handleFileInputChange = () => {
        const file = thumbRef.current.files[0];
        const reader = new FileReader();

        reader.addEventListener("load", function () {
            // convert image file to base64 string
            setImageSrc(String(reader.result))
        }, false);

        if (file) {
            reader.readAsDataURL(file); 
        }
        setModalIsOpen(true);
    }

    const handleModalSubmit = (e) => {
        setCrop(e);
    }
    const handleModalButtonClose = () => {
        console.log(crop)
        if (
            crop.height == 0 || crop.width == 0
        ) {
            return;
        }
        setModalIsOpen(false);
    }
    return (
        <div className="container">
            <Head>
                <title>Login / Signup</title>
                <link rel="icon" href="/favicon.png" />
            </Head>
            <Header auth={props.auth} />
            <section className="write">
                <div className="sectionTitle">Write</div>
                <div className="post">
                    <div className="one-grp grp">
                        <label htmlFor="">Title</label>
                        <input type="text" />
                    </div>
                    <div className="two-grp grp">
                        <div className="single-input">
                            <label htmlFor="">Thumbnail</label>
                            <input
                                type="file"
                                name=""
                                onChange={handleFileInputChange}
                                id="act-btn"
                                ref={thumbRef}
                            />
                        </div>
                        <div className="single-input">
                            <label htmlFor="">Tags</label>
                            <div className="tag-input">
                                <input
                                    type="text"
                                    onChange={handleTagInputChange}
                                    onKeyPress={handleKeyPress}
                                    ref={tagsRef}
                                />
                                <p>{suggested}</p>
                            </div>
                        </div>
                    </div>
                    {tags.length ? (
                        <div className="tags">
                            <label htmlFor="">Tags</label>
                            <ul>
                                {tags.map((e) => (
                                    <li>{e}</li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        false
                    )}
                    <div className="md grp">
                        <label htmlFor="">Body</label>
                        <textarea name="" id=""></textarea>
                    </div>
                    <div className="btns grp">
                        <button>Publish</button>
                    </div>
                </div>
            </section>
            <div className="divider"></div>
            <div className="footer">
                <div className="main">made with {"<3"} by shivam kumar</div>
                <div className="sec">using Nextjs, Mongodb and Node</div>
            </div>
            <Modal
                onRequestClose={() => {
                    setModalIsOpen(false);
                }}
                isOpen={modalIsOpen}
                contentLabel="Resize Thumbnail"
            >
                <div style={{display:"flex",flexDirection:'column'}}>
                    <CropDemo
                        src={imageSrc}
                        submit={handleModalSubmit}
                    />
                    <button
                        className="modal-button"
                        onClick={handleModalButtonClose}
                    >
                        Submit
                    </button>
                </div>
            </Modal>
        </div>
    );
};

function CropDemo(props: any) {
    const [crop, setCrop] = useState({ aspect: 1 / 1 } as any);
    return (
        <ReactCrop
            src={props.src}
            crop={crop}
            onChange={(newCrop) => {
                setCrop(newCrop);
                props.submit(newCrop);
            }}
        />
    );
}
  