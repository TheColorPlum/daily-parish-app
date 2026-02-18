import React, { useRef, useImperativeHandle, forwardRef, useState } from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CANDLE_SIZE = Math.min(SCREEN_WIDTH * 0.6, 280);

// Timing constants from spec
const CROSSFADE_DURATION = 250;
const VIDEO_PLAY_DURATION = 650;
const PAUSE_AFTER_VIDEO = 600;

export interface CandleAnimationRef {
  playLightAnimation: () => Promise<void>;
  reset: () => void;
}

interface CandleAnimationProps {
  onAnimationComplete?: () => void;
}

export const CandleAnimation = forwardRef<CandleAnimationRef, CandleAnimationProps>(
  ({ onAnimationComplete }, ref) => {
    const videoRef = useRef<Video>(null);
    const [isLit, setIsLit] = useState(false);
    
    // Animation values
    const unlitOpacity = useSharedValue(1);
    const litOpacity = useSharedValue(0);

    const unlitStyle = useAnimatedStyle(() => ({
      opacity: unlitOpacity.value,
    }));

    const litStyle = useAnimatedStyle(() => ({
      opacity: litOpacity.value,
    }));

    useImperativeHandle(ref, () => ({
      playLightAnimation: async () => {
        return new Promise<void>(async (resolve) => {
          // Start crossfade to video
          unlitOpacity.value = withTiming(0, {
            duration: CROSSFADE_DURATION,
            easing: Easing.out(Easing.ease),
          });
          litOpacity.value = withTiming(1, {
            duration: CROSSFADE_DURATION,
            easing: Easing.out(Easing.ease),
          });

          setIsLit(true);

          // Play video
          if (videoRef.current) {
            await videoRef.current.setPositionAsync(0);
            await videoRef.current.playAsync();
          }

          // Medium haptic when flame catches (200ms into animation per spec)
          setTimeout(() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }, 200);

          // Wait for video duration + pause
          setTimeout(() => {
            if (videoRef.current) {
              // Keep showing last frame (don't stop, just pause for looping effect)
            }
            
            // Wait for the pause period
            setTimeout(() => {
              onAnimationComplete?.();
              resolve();
            }, PAUSE_AFTER_VIDEO);
          }, VIDEO_PLAY_DURATION);
        });
      },

      reset: () => {
        setIsLit(false);
        unlitOpacity.value = withTiming(1, { duration: CROSSFADE_DURATION });
        litOpacity.value = withTiming(0, { duration: CROSSFADE_DURATION });
        
        if (videoRef.current) {
          videoRef.current.stopAsync();
          videoRef.current.setPositionAsync(0);
        }
      },
    }));

    return (
      <View style={styles.container}>
        {/* Unlit candle (PNG) */}
        <Animated.View style={[styles.candleContainer, unlitStyle]}>
          <Image
            source={require('../../../../assets/candle-unlit.png')}
            style={styles.candleImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Lit candle (Video) */}
        <Animated.View style={[styles.candleContainer, styles.litContainer, litStyle]}>
          <Video
            ref={videoRef}
            source={require('../../../../assets/candle-lit.mp4')}
            style={styles.candleVideo}
            resizeMode={ResizeMode.CONTAIN}
            isLooping
            shouldPlay={false}
            isMuted
          />
        </Animated.View>
      </View>
    );
  }
);

CandleAnimation.displayName = 'CandleAnimation';

const styles = StyleSheet.create({
  container: {
    width: CANDLE_SIZE,
    height: CANDLE_SIZE * 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  candleContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  litContainer: {
    // Positioned on top
  },
  candleImage: {
    width: '100%',
    height: '100%',
  },
  candleVideo: {
    width: '100%',
    height: '100%',
  },
});
