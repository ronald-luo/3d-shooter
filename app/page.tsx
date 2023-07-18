"use client";

import { useRef, useState, useEffect } from 'react';
import { Canvas, useThree, useFrame } from 'react-three-fiber';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import * as THREE from 'three';

function Dot({position, onClick}) {
  const meshRef = useRef();

  const handleClick = () => {

    onClick();

  };


  return (
    <mesh ref={meshRef} position={position} onClick={handleClick}>
      <circleBufferGeometry args={[0.1]} />
      <meshBasicMaterial color="red" />
    </mesh>
  );
}

function Crosshair() {

  // center of the screen
  const innerWidth = window.innerWidth / 2;
  const innerHeight = window.innerHeight / 2;

  // responsive
  const [width, setWidth] = useState(innerWidth);
  const [height, setHeight] = useState(innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth / 2);
      setHeight(window.innerHeight / 2);
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);


  return (
    <div
      style={{
        position: 'fixed',
        left: width,
        top: height,
        transform: 'translate(-50%, -50%)',
        color: 'green',
        fontSize: '24px',
        fontWeight: 'bold',
        pointerEvents: 'none',
      }}
    >
      +
    </div>
  );
}


function DotsGenerator({ numDots, delay }) {
  const [dots, setDots] = useState([]);
  const [currentDotIndex, setCurrentDotIndex] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const crosshairCenter = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const { viewport, camera, gl } = useThree();


  useEffect(() => {
    if (currentDotIndex < numDots) {
      const timeout = setTimeout(() => {
        const newDot = {
          position: [
            (Math.random() * 2 - 1) * viewport.width * 0.4, // x position (-1 to 1)
            (Math.random() * 2 - 1) * viewport.height * 0.4, // y position (-1 to 1)
            -Math.random() * 5, // z position (-5 to 0)
          ],
          id: currentDotIndex,
        };

        setDots((prevDots) => [...prevDots, newDot]);
        setCurrentDotIndex((prevIndex) => prevIndex + 1);
      }, delay);

      return () => clearTimeout(timeout);
    }
  }, [currentDotIndex, numDots, delay, viewport.width, viewport.height]);
  
  useEffect(
    () => {
      const controls = new PointerLockControls(camera, gl.domElement);


      document.addEventListener('click', function () {
        if (controls.isLocked === false && !isLocked) {
          controls.lock();
          setIsLocked(true);
        } else {
          // Handle click event when pointer is locked

          useEffect(() => {}, [camera, gl]);

          const raycaster = new THREE.Raycaster();
          const mouse = new THREE.Vector2();

          mouse.x = (crosshairCenter.x / window.innerWidth) * 2 - 1;

          mouse.y = -(crosshairCenter.y / window.innerHeight) * 2 + 1; 

          raycaster.setFromCamera(0, camera);

          console.log(gl.domElement.children)

          const intersects = raycaster.intersectObjects(gl.domElement.children);

          console.log(intersects)

          if (intersects.length > 0) {
            const { object } = intersects[0];
            const dotId = object.parent.uuid;
            handleDotClick(dotId);
          }

        }
      });

      return () => {
        controls.dispose();
      };
    },
    [camera, gl]
  );


  useFrame(() => {
    camera.updateProjectionMatrix();
  });

  const handleDotClick = (dotId) => {
    // Handle dot click event
    console.log(`Dot ${dotId} clicked!`);
    setDots((prevDots) => prevDots.filter((dot) => dot.id !== dotId));
  };

  return (
    <>
      {dots.map((dot, index) => (
        <Dot 
          key={index} 
          position={dot.position} 
          onClick={() => handleDotClick(dot.id)} 
          />
      ))}
    </>
  );
}

export default function Home() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas style={{ background: '#000000' }}>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <DotsGenerator numDots={100} delay={3000} />
      </Canvas>
      <Crosshair />
    </div>
  );
}