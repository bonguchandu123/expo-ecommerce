import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { useEffect, useRef, useState } from 'react';

const { width, height } = Dimensions.get('window');

const WELCOME_MESSAGES = [
  { title: "Welcome", subtitle: "Get ready for something amazing" },
  { title: "Stay Connected", subtitle: "Everything you need in one place" },
  { title: "Let's Begin", subtitle: "Your journey starts now" }
];

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  
  // Animation values
  const fadeValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0.5)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const progressValue = useRef(new Animated.Value(0)).current;
  
  // Particle animations
  const particle1 = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const particle2 = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const particle3 = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  
  const particleOpacity1 = useRef(new Animated.Value(0)).current;
  const particleOpacity2 = useRef(new Animated.Value(0)).current;
  const particleOpacity3 = useRef(new Animated.Value(0)).current;

  // Spinning circle animation
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initial fade in
    Animated.timing(fadeValue, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Scale animation for logo
    Animated.spring(scaleValue, {
      toValue: 1,
      tension: 10,
      friction: 3,
      useNativeDriver: true,
    }).start();

    // Continuous rotation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Progress bar animation
    Animated.timing(progressValue, {
      toValue: 1,
      duration: 3000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    // Floating particles
    animateParticles();

    // Change messages every second
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => {
        if (prev < WELCOME_MESSAGES.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1000);

    // Finish after all messages
    const finishTimer = setTimeout(() => {
      Animated.timing(fadeValue, {
        toValue: 0,
        duration: 3000,
        useNativeDriver: true,
      }).start(() => onFinish());
    }, 5000);

    return () => {
      clearInterval(messageInterval);
      clearTimeout(finishTimer);
    };
  }, []);

  // Animate text when message changes
  useEffect(() => {
    titleOpacity.setValue(0);
    subtitleOpacity.setValue(0);

    Animated.sequence([
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentMessageIndex]);

  const animateParticles = () => {
    const animateParticle = (particle: Animated.ValueXY, opacity: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(particle, {
              toValue: { x: Math.random() * 100 - 50, y: -150 },
              duration: 2000,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(opacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.timing(opacity, {
                toValue: 0,
                duration: 1500,
                useNativeDriver: true,
              }),
            ]),
          ]),
          Animated.timing(particle, {
            toValue: { x: 0, y: 0 },
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animateParticle(particle1, particleOpacity1, 0);
    animateParticle(particle2, particleOpacity2, 600);
    animateParticle(particle3, particleOpacity3, 1200);
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeValue }]}>
      {/* Animated background gradient effect */}
      <View style={styles.gradientOverlay} />
      
      {/* Floating particles */}
      <Animated.View
        style={[
          styles.particle,
          {
            transform: [
              { translateX: particle1.x },
              { translateY: particle1.y }
            ],
            opacity: particleOpacity1,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.particle,
          styles.particle2,
          {
            transform: [
              { translateX: particle2.x },
              { translateY: particle2.y }
            ],
            opacity: particleOpacity2,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.particle,
          styles.particle3,
          {
            transform: [
              { translateX: particle3.x },
              { translateY: particle3.y }
            ],
            opacity: particleOpacity3,
          },
        ]}
      />

      {/* Main content */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [{ scale: scaleValue }],
          },
        ]}
      >
        {/* Outer spinning ring */}
        <Animated.View
          style={[
            styles.outerRing,
            {
              transform: [{ rotate: spin }],
            },
          ]}
        />
        
        {/* Inner logo circle */}
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>M</Text>
        </View>
      </Animated.View>

      {/* Welcome messages */}
      <View style={styles.messageContainer}>
        <Animated.Text
          style={[
            styles.title,
            { opacity: titleOpacity },
          ]}
        >
          {WELCOME_MESSAGES[currentMessageIndex].title}
        </Animated.Text>
        <Animated.Text
          style={[
            styles.subtitle,
            { opacity: subtitleOpacity },
          ]}
        >
          {WELCOME_MESSAGES[currentMessageIndex].subtitle}
        </Animated.Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            { width: progressWidth },
          ]}
        />
      </View>

      {/* Dots indicator */}
      <View style={styles.dotsContainer}>
        {WELCOME_MESSAGES.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentMessageIndex && styles.activeDot,
            ]}
          />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientOverlay: {
    position: 'absolute',
    width: width * 2,
    height: height * 2,
    backgroundColor: '#000000',
    opacity: 0.3,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 60,
  },
  outerRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: 'transparent',
    borderTopColor: '#00D9FF',
    borderRightColor: '#00D9FF',
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#00D9FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00D9FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#00D9FF',
    textShadowColor: '#00D9FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 80,
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 24,
  },
  progressContainer: {
    width: width - 80,
    height: 3,
    backgroundColor: '#1a1a1a',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 30,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#00D9FF',
    shadowColor: '#00D9FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333333',
  },
  activeDot: {
    backgroundColor: '#00D9FF',
    shadowColor: '#00D9FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00D9FF',
    top: '50%',
    left: '30%',
    shadowColor: '#00D9FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  particle2: {
    left: '50%',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  particle3: {
    left: '70%',
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});