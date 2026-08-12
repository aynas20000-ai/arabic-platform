import {
  initializeApp
} from
"https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
  initializeAuth,
  browserLocalPersistence
} from
"https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp
} from
"https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


const firebaseConfig = {
  apiKey:
    "AIzaSyB48av9gx4jzFyYoUQtcLwaR52qETevKGs",

  authDomain:
    "afaq-language-platform.firebaseapp.com",

  projectId:
    "afaq-language-platform",

  storageBucket:
    "afaq-language-platform.firebasestorage.app",

  messagingSenderId:
    "362601061474",

  appId:
    "1:362601061474:web:bc405291332b9e4ef9453b"
};


const app =
  initializeApp(firebaseConfig);


const auth =
  initializeAuth(
    app,
    {
      persistence:
        browserLocalPersistence
    }
  );


const db =
  getFirestore(app);


window.saveNafesChallenge = async function({
  number,
  title,
  name,
  score,
  total
}){

  const user =
    auth.currentUser;


  if(!user){

    console.log(
      "لم يتم تسجيل الدخول"
    );

    return {
      success:false,
      reason:"not-authenticated"
    };

  }


  try{

    const percentage =
      Math.round(
        (
          score /
          total
        ) *
        100
      );


    const certificateEarned =
      percentage >= 80;


    const studentRef =
      doc(
        db,
        "students",
        user.uid
      );


    await setDoc(
      studentRef,
      {
        "معرف_المستخدم":
          user.uid,

        "البريد":
          user.email || "",

        "الاسم":
          name ||
          user.displayName ||
          "طالبة غير مسماة"
      },
      {
        merge:true
      }
    );


    const challengeKey =
      `challenge${number}`;


    const updates = {

      "نافس_المتابعة.اطلعت":
        true,

      "نافس_المتابعة.آخر_تفاعل":
        serverTimestamp(),

      "نافس_المتابعة.آخر_قسم":
        title,

      "نافس_المتابعة.آخر_تحديث_للتحديات":
        serverTimestamp()

    };


    updates[
      `نافس_المتابعة.نتائج_التحديات.${challengeKey}`
    ] = {

      رقم_التحدي:
        number,

      اسم_التحدي:
        title,

      الدرجة:
        score,

      المجموع:
        total,

      النسبة:
        percentage,

      الشهادة:
        certificateEarned,

      اسم_الطالبة:
        name

    };


    await updateDoc(
      studentRef,
      updates
    );


    return {
      success:true,
      percentage,
      certificateEarned
    };

  }

  catch(error){

    console.error(
      "خطأ حفظ تحدي نافس:",
      error
    );


    return {
      success:false,
      reason:"firebase-error",
      error
    };

  }

};
