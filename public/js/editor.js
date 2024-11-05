const blogTitleField = document.querySelector(".title");
const articleFeild = document.querySelector(".article");

// banner
const bannerImage = document.querySelector("#banner-upload");
const banner = document.querySelector(".banner");
let bannerPath;

const publishBtn = document.querySelector(".publish-btn");
const uploadInput = document.querySelector("#image-upload");

bannerImage.addEventListener("change", () => {
  uploadImage(bannerImage, "banner");
});

uploadInput.addEventListener("change", () => {
  uploadImage(uploadInput, "image");
});

const uploadImage = (uploadFile, uploadType) => {
  const [file] = uploadFile.files;
  if (file && file.type.includes("image")) {
    const formdata = new FormData();
    formdata.append("image", file);

    // First, check if the backend is ready
    fetch("/health-check") // Replace with an actual health-check route in your backend
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Health check failed: ${response.status}`);
        }
        // Proceed with the file upload once backend is healthy
        return fetch("/upload", {
          method: "POST",
          body: formdata,
        });
      })
    //   .then((response) => {
    //     if (!response.ok) {
    //       throw new Error(`Server error: ${response.status}`);
    //     }
    //     return response.json(); // Parse the response as JSON
    //   })


      // .then((response) => {
      //   if (!response.ok) {
      //     throw new Error(`Server error: ${response.status}`);
      //   }
      //   return response.blob();
      //   // Parse the response as a Blob
      // })
      // .then((blob) => {
      //   const url = URL.createObjectURL(blob);
      //   if (uploadType === "image") {
      //     addImage(url, file.name);
      //     // Assuming `addImage` displays the image
      //   } else {
      //     bannerPath = url;
      //     banner.style.backgroundImage = `url("${bannerPath}")`;
      //   }
      // })
      // .catch((error) => {
      //   // Handle errors during health-check, fetch, or JSON parsing
      //   console.error("Error during image upload:", error);
      //   alert("Failed to upload image. Please try again.");
      // });

      .then(response => {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
              return response.json();
          } else {
              throw new Error("Server response is not JSON");
          }
      })
      .then(data => {
          if (uploadType === "image") {
              addImage(data.imageUrl, file.name);
          } else {
              bannerPath = `${location.origin}/${data.imageUrl}`;
              banner.style.backgroundImage = `url("${bannerPath}")`;
          }
      })
      .catch(err => {
          console.error("Upload failed:", err);
      });
  } else {
    alert("Please upload an image file.");
  }
};

const addImage = (imagepath, alt) => {
  let curPos = articleFeild.selectionStart;
  let textToInsert = `\r![${alt}](${imagepath})\r`;
  articleFeild.value =
    articleFeild.value.slice(0, curPos) +
    textToInsert +
    articleFeild.value.slice(curPos);
};

let months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

publishBtn.addEventListener("click", () => {
  if (articleFeild.value.length && blogTitleField.value.length) {
    // generating id
    let letters = "abcdefghijklmnopqrstuvwxyz";
    let blogTitle = blogTitleField.value.split(" ").join("-");
    let id = "";
    for (let i = 0; i < 4; i++) {
      id += letters[Math.floor(Math.random() * letters.length)];
    }

    // setting up docName
    let docName = `${blogTitle}-${id}`;
    let date = new Date(); // for published at info

    //access firstore with db variable;
    db.collection("blog-post")
      .doc(docName)
      .set({
        title: blogTitleField.value,
        article: articleFeild.value,
        bannerImage: bannerPath,
        publishedAt: `${date.getDate()} ${
          months[date.getMonth()]
        } ${date.getFullYear()}`,
      })
      .then(() => {
        location.href = `/${docName}`;
      })
      .catch((err) => {
        console.error(err);
      });
  }
});
