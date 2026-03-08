import React from 'react';
import Layout from '../components/Layout';

const EpicGallery = () => {
  const images = [
    "/assets/img/home-1/team/team-1.jpg",
    "/assets/img/home-1/team/team-2.jpg",
    "/assets/img/home-1/team/team-3.jpg",
    "/assets/img/home-1/team/team-4.jpg",
    "/assets/img/home-1/team/team-5.jpg",
    "/assets/img/home-1/team/team-6.jpg",
    "/assets/img/home-1/news/news-1.jpg",
    "/assets/img/home-1/news/news-2.jpg",
    "/assets/img/home-1/news/news-3.jpg",
    "/assets/img/home-1/news/news-4.jpg",
    "/assets/img/home-1/news/news-5.jpg",
    "/assets/img/home-1/news/news-6.jpg",
  ];

  const fallbackImage = "/assets/img/breadcrumb1.jpg";

  return (
    <>
      <Layout>

        <div style={{ padding: '60px', textAlign: 'center' , paddingTop:'130px' }}>
          <h1>Epic Gallery</h1>
          <p>Explore amazing moments captured from the CrackMeNow community.</p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "20px",
              marginTop: "40px",
            }}
          >
            {images.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt={`Gallery ${idx + 1}`}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = fallbackImage;
                }}
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                  objectFit: "cover",
                  height: "200px",
                }}
              />
            ))}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default EpicGallery;
