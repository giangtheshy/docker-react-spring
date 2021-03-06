import React, { useState, useEffect } from "react";
import GoogleLogin from "react-google-login";
import FacebookLogin from "react-facebook-login";
import { GrGooglePlus } from "react-icons/gr";
import { FaFacebookF } from "react-icons/fa";
import { HiEye, HiHeart } from "react-icons/hi";
import { GiPopcorn } from "react-icons/gi";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { loginUser, logoutUser, registerUser, loginGoogle, loginFacebook, updateAvatar } from "actions/user.action";
import { getFavorites, getWatched } from "actions/film.action";

import ListFilm from "components/utils/ListFilm/ListFilm";
import storage from "apis/firebase";
import Loading from "components/utils/Loading/Loading";

import "./Login.scss";

const Login = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.users);
  const favorites = useSelector((state) => state.films.favorites);
  const watched = useSelector((state) => state.films.watched);
  const [active, setActive] = useState("heart");
  const [isLogin, setIsLogin] = useState(true);
  const [userData, setUserData] = useState({ username: "", password: "" });
  const [dataReg, setDataReg] = useState({
    email: "",
    username: "",
    name: "",
    password: "",
    passwordCheck: "",
  });
  const [modalAvatar, setModalAvatar] = useState(false);
  const [image, setImage] = useState("");
  const [progress, setProgress] = useState(0);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingRegister, setLoadingRegister] = useState(false);
  const [loadingSocial, setLoadingSocial] = useState({ facebook: false, google: false });

  const history = useHistory();
  useEffect(() => {
    if (user.username) {
      dispatch(getFavorites());
      dispatch(getWatched());
    }
  }, [user.username]);
  const handleSuccess = async (res) => {
    const { name, imageUrl, email } = res.profileObj;
    const result = await dispatch(loginGoogle({ name, avatar: imageUrl, email }, setLoadingSocial));
    if (result.success) {
      localStorage.setItem("isLoggedIn", "1");
      history.push("/");
    } else {
      alert("????ng nh???p th???t b???i");
    }
  };
  const handleFailure = () => {
    alert("Some errors were occur when login");
  };
  const handleSuccessFacebook = async (res) => {
    const { name, email, picture } = res;

    const result = await dispatch(loginFacebook({ name, avatar: picture?.data?.url, email }, setLoadingSocial));

    if (result.success) {
      localStorage.setItem("isLoggedIn", "1");
      history.push("/");
    } else {
      alert("????ng nh???p th???t b???i");
    }
  };
  const handleClickLogout = async () => {
    dispatch(logoutUser());
    localStorage.removeItem("isLoggedIn");
    history.push("/");
  };
  const handleOnchangeLogin = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };
  const handleOnchangeRegister = (e) => {
    setDataReg({ ...dataReg, [e.target.name]: e.target.value });
  };
  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    if (userData.username !== "" && userData.password !== "") {
      try {
        const message = await dispatch(loginUser(userData, setLoadingLogin));
        if (!message) {
          localStorage.setItem("isLoggedIn", "1");
          history.push("/");
        } else {
          alert(message);
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      alert("must fill in full fields");
    }
    setUserData({ email: "", password: "" });
  };
  const handleSubmitRegister = async (e) => {
    e.preventDefault();
    if (dataReg.passwordCheck !== dataReg.password) {
      console.log(dataReg);
      alert("M???t kh???u kh??ng kh???p!");
      return;
    }
    if (userData.password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=.*[0-9]).{8,}$/)) {
      alert("M???t kh???u ph???i c?? 1 s???,1 ch??? in hoa, 1 ch??? in th?????ng v?? 1 k?? t??? ?????c bi???t");
      return;
    }
    if (
      dataReg.name !== "" &&
      dataReg.username !== "" &&
      dataReg.email !== "" &&
      dataReg.password !== "" &&
      dataReg.passwordCheck !== ""
    ) {
      if (dataReg.password.length >= 5 && dataReg.username.length >= 5) {
        const mess = await dispatch(registerUser(dataReg, setLoadingRegister));
        alert(mess);
      }
      setDataReg({ email: "", name: "", password: "", username: "", passwordCheck: "" });
    } else {
      alert("Please Fill in full fields and correct type");
    }
  };
  const handleChangeFile = (e) => {
    const value = e.target.files[0];
    if (value) {
      const uploadTask = storage.ref(`avatar/${value.name}`).put(value);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setProgress(progress);
        },
        (error) => console.log(error),
        () => {
          storage
            .ref("avatar")
            .child(value.name)
            .getDownloadURL()
            .then((url) => {
              setImage(url);
            });
        },
      );
    }
  };

  const handleChangeAvatar = (e) => {
    e.preventDefault();
    console.log(image);
    if (image) {
      dispatch(updateAvatar({ avatar: image }));
      setModalAvatar(false);
    }
  };
  if (user.username) {
    return (
      <section className="account">
        {modalAvatar && (
          <div className="modal-avatar">
            <form onSubmit={handleChangeAvatar}>
              <button type="button" className="logout-btn" onClick={() => setModalAvatar(false)}>
                <span className="child">????ng</span>
              </button>
              {image && <img src={image} alt="avatar" />}
              <label htmlFor="file">Ch???n ???nh t??? m??y c???a b???n:</label>
              {progress > 0 && <span className="bold main-clr">{progress}</span>}
              <input type="file" onChange={handleChangeFile} id="file" />
              <button type="submit" className="btn-submit">
                <span className="child"> X??c nh???n</span>
              </button>
            </form>
          </div>
        )}
        <button className="logout-btn" onClick={handleClickLogout}>
          <span className="child"> ????ng Xu???t</span>
        </button>
        <button className="change-avatar" onClick={() => setModalAvatar(!modalAvatar)}>
          <span className="child">Thay ?????i ???nh ?????i di???n</span>
        </button>
        {user.type !== "premium" && (
          <button className="upgrade" onClick={() => history.push("/account/payment")}>
            <span className="child">N???p l???n ?????u</span>
          </button>
        )}
        <div className="btn-group">
          <button className={`add-fav ${active === "heart" ? "active" : ""}`} onClick={() => setActive("heart")}>
            <span className="child">
              <HiHeart /> Y??u Th??ch
            </span>
          </button>
          <button className={`watch ${active === "eye" ? "active" : ""}`} onClick={() => setActive("eye")}>
            <span className="child">
              <HiEye /> ???? Xem
            </span>
          </button>
        </div>
        <ListFilm type="row" films={active === "heart" ? favorites : watched} />
      </section>
    );
  }
  return (
    <section className="login">
      <div className="login">
        <div className="logo">
          <GiPopcorn className="icon-logo" />
          <span className="bold orange-text">PHIM</span>PRO
        </div>
        <div className="sub-title">
          {isLogin ? (
            <p className="title">
              {" "}
              <span className="orange-text bold">????NG NH???P</span> ????? c?? tr???i nghi???m t???t h??n!
            </p>
          ) : (
            <p className="title">
              {" "}
              <span className="orange-text bold">????NG K??</span> n???u b???n ch??a c?? b???t k?? t??i kho???n n??o!
            </p>
          )}
        </div>
        {isLogin ? (
          <form onSubmit={handleSubmitLogin}>
            <label htmlFor="username" className="text-input">
              <input
                type="text"
                name="username"
                id="username"
                value={userData.username}
                onChange={handleOnchangeLogin}
                placeholder="T??i Kho???n"
              />
            </label>
            <label htmlFor="password" className="text-input">
              <input
                type="password"
                name="password"
                id="password"
                value={userData.password}
                onChange={handleOnchangeLogin}
                placeholder="M???t Kh???u"
              />
            </label>
            <button type="submit" className="btn-submit btn-slice">
              <span className="child">{loadingLogin ? <Loading /> : "????ng Nh???p"} </span>
            </button>
            <hr className="hr-slice"></hr>
            <p className="forgot" onClick={() => history.push("/forgot-password")}>
              Qu??n m???t kh???u
            </p>
            <p className="forgot" onClick={() => setIsLogin(false)}>
              ????ng k??
            </p>
            <hr className="hr-slice2"></hr>
          </form>
        ) : (
          <form onSubmit={handleSubmitRegister}>
            <label htmlFor="emailReg" className="text-input">
              <input
                type="text"
                name="email"
                id="emailReg"
                value={dataReg.email}
                onChange={handleOnchangeRegister}
                placeholder="Email"
              />
            </label>
            <label htmlFor="name" className="text-input">
              <input
                type="text"
                name="name"
                id="name"
                value={dataReg.name}
                onChange={handleOnchangeRegister}
                placeholder="H??? t??n ?????y ?????"
              />
            </label>
            <label htmlFor="usernameReg" className="text-input">
              <input
                type="text"
                name="username"
                id="usernameReg"
                value={dataReg.username}
                onChange={handleOnchangeRegister}
                placeholder="T??n t??i kho???n"
              />
            </label>
            <label htmlFor="passwordReg" className="text-input">
              <input
                type="password"
                name="password"
                id="passwordReg"
                value={dataReg.password}
                onChange={handleOnchangeRegister}
                placeholder="M???t kh???u"
              />
            </label>
            <label htmlFor="passwordRegCheck" className="text-input">
              <input
                type="password"
                name="passwordCheck"
                id="passwordRegCheck"
                value={dataReg.passwordCheck}
                onChange={handleOnchangeRegister}
                placeholder="X??c nh???n m???t kh???u"
              />
            </label>
            <label htmlFor="photo-url" className="photo-url"></label>
            <button type="submit" className="btn-submit btn-slice">
              <span className="child"> {loadingRegister ? <Loading /> : "????ng K??"}</span>
            </button>
            <hr className="hr-slice"></hr>
            <p className="forgot" onClick={() => setIsLogin(true)}>
              ????ng nh???p ngay!
            </p>
            <hr className="hr-slice2"></hr>
          </form>
        )}

        <div className="social-login">
          <GoogleLogin
            clientId="829204377370-b6ut6u8efth0q8cdhcgmg681mjj09bce.apps.googleusercontent.com"
            onSuccess={handleSuccess}
            onFailure={handleFailure}
            cookiePolicy="single_host_origin"
            render={(props) => (
              <button className="google_login " onClick={props.onClick} disabled={props.disabled}>
                {loadingSocial.google ? <Loading /> : <GrGooglePlus className="google_login_icon" />}{" "}
                <span className="google_login_text">????ng nh???p b???ng Google</span>
              </button>
            )}
          />
          <FacebookLogin
            appId="288252092999789"
            autoLoad={false}
            fields="name,email,picture"
            callback={handleSuccessFacebook}
            cssClass="fb_btn"
            icon={loadingSocial.facebook ? <Loading /> : <FaFacebookF className="icon" />}
            textButton={<span className="fb-text">????ng nh???p b???ng Facebook</span>}
            isMobile={false}
            redirectUri="https://phim-pro.netlify.app"
          />
        </div>
      </div>
    </section>
  );
};

export default Login;
