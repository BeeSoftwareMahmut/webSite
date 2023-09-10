




import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const Deneme = () => {




    const [imgUrl, setImgeUrl] = useState("");
    const [imgName, setImgName] = useState(null);
    const [imageUrl, setImageUrl] = useState("");
    const handleDosyaSecimi = (e) => {
        const selectedFile = e.target.files[0]; // Kullanıcının seçtiği dosya


        if (selectedFile) {
            const fileURL = URL.createObjectURL(selectedFile);
            setImgeUrl(fileURL);
            setImgName(selectedFile.name);
        }
    };

    const handleAddImage = (e) => {

        e.preventDefault();

        const formData = new FormData();
        formData.append("image", imgUrl);
        formData.append("name", imgName)



        axios.post("http://localhost:5000/deneme/deneme", formData)
            .then((res) => {
                toast.success(`${res.data.message}`, {
                    position: toast.POSITION.TOP_CENTER,
                });
            }
            )
            .catch((err) => {
                toast.error('Resim eklerken bir hata oluştu', {
                    position: toast.POSITION.TOP_RIGHT, // Uyarının konumu (isteğe bağlı)
                });
            });
    };

    const getData = (e) => {

        e.preventDefault();

        axios.get("http://localhost:5000/deneme/get_deneme")
            .then((res) => {
                const byteArray = [...res.data.binaryData[0].img.data];
               
            }
            )
            .catch((err) => {
                console.log(err);
            });
    }



  
    return (
        <div>
            <h1 className="text-2xl mb-4">Deneme Paneli</h1>

            {/* Yeni resim eklemek için form */}
            <form>
                <div className="mb-4">
                    <label
                        htmlFor="imgUrl"
                        className="block text-gray-700 text-sm font-bold mb-2"
                    >
                        Resim Seç
                    </label>

                    <input
                        type="file"
                        id="imgUrl"
                        name="imgUrl"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        accept="image/*"
                        onChange={handleDosyaSecimi}
                    />
                </div>
                <button
                    type="button"
                    onClick={handleAddImage}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    Resim Ekle
                </button>
            </form>
            <button
                type="button"
                onClick={getData}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
                Resim Ekle
            </button>
            {imageUrl && <img src={imageUrl} alt="resim" />}
        </div>
    )
}

export default Deneme;


