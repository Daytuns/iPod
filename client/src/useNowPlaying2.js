import { useState, useEffect } from "react";

export const useNowPlaying2 = () => {
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const fetchCurrentlyPlaying = async () => {
    try {
      const data = await window.electronAPI.getNowPlaying();
      if (data?.error) throw new Error(data.error);

      const transformed = {
        item: {
          name: data.title,
          artists: data.artist
            ? data.artist.split(",").map(name => ({ name: name.trim() }))
            : [],
          album: {
            name: data.album,
            images: [{ url: data.albumImageUrl }]
          },
          duration_ms: data.duration_ms ?? 180000
        },
        is_playing: data.isPlaying,
        progress_ms: data.progress_ms ?? 0
      };

      setCurrentlyPlaying(transformed);
      setIsPlaying(transformed.is_playing);
    } catch (err) {
      console.error("useNowPlaying: Failed to fetch now playing", err.message);
    }
  };

  useEffect(() => {
    console.log("electronAPI on window:", window.electronAPI);
    fetchCurrentlyPlaying();
    const interval = setInterval(fetchCurrentlyPlaying, 5000);
    return () => clearInterval(interval);
  }, []);

  return {
    currentlyPlaying,
    isPlaying,
    fetchCurrentlyPlaying,
    togglePlayback: () => {}, // implement later
    playNext: () => {},
    playPrevious: () => {},
    device: { name: "Electron iPod" },
    seekPosition: () => {}
  };
};

// import { useState, useEffect } from "react";

// export const useNowPlaying2 = () => {
//   const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [device, setDevice] = useState({ name: "Electron iPod" });

//   const fetchCurrentlyPlaying = async () => {
//     try {
//       const data = await window.electronAPI.getNowPlaying();
//       if (data?.error) throw new Error(data.error);

//       const transformed = {
//         item: {
//           name: data.title,
//           artists: data.artist
//             ? data.artist.split(",").map(name => ({ name: name.trim() }))
//             : [],
//           album: {
//             name: data.album,
//             images: [{ url: data.albumImageUrl }],
//           },
//           duration_ms: data.duration_ms ?? 180000,
//         },
//         is_playing: data.isPlaying,
//         progress_ms: data.progress_ms ?? 0,
//       };

//       setCurrentlyPlaying(transformed);
//       setIsPlaying(transformed.is_playing);

//       // Also update device info from Electron API if available
//       if (data.deviceName) {
//         setDevice({ name: data.deviceName });
//       }
//     } catch (err) {
//       console.error("useNowPlaying2: Failed to fetch now playing", err.message);
//     }
//   };

//   const togglePlayback = async () => {
//     try {
//       const success = await window.electronAPI.togglePlayback();
//       if (success) {
//         // Optimistically toggle isPlaying
//         setIsPlaying(prev => !prev);
//         fetchCurrentlyPlaying();
//       }
//     } catch (err) {
//       console.error("togglePlayback error:", err);
//     }
//   };

//   const playNext = async () => {
//     try {
//       const success = await window.electronAPI.playNext();
//       if (success) {
//         setTimeout(fetchCurrentlyPlaying, 1000);
//       }
//     } catch (err) {
//       console.error("playNext error:", err);
//     }
//   };

//   const playPrevious = async () => {
//     try {
//       const success = await window.electronAPI.playPrevious();
//       if (success) {
//         setTimeout(fetchCurrentlyPlaying, 1000);
//       }
//     } catch (err) {
//       console.error("playPrevious error:", err);
//     }
//   };

//   const seekPosition = async (pos) => {
//     const roundedPos = Math.round(pos);
//     try {
//       const success = await window.electronAPI.seekPosition(roundedPos);
//       if (!success) {
//         console.error("seekPosition failed");
//       }
//     } catch (err) {
//       console.error("seekPosition error:", err);
//     }
//   };

//   useEffect(() => {
//     fetchCurrentlyPlaying();
//     const interval = setInterval(fetchCurrentlyPlaying, 5000);
//     return () => clearInterval(interval);
//   }, []);

//   return {
//     currentlyPlaying,
//     isPlaying,
//     device,
//     fetchCurrentlyPlaying,
//     togglePlayback,
//     playNext,
//     playPrevious,
//     seekPosition,
//   };
// };

