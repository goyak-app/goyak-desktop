use crate::errors::DublyError;

pub struct PcmResampler {
    pub target_sample_rate: u32,
    pub target_channels: u16,
}

impl PcmResampler {
    pub fn new(target_sample_rate: u32, target_channels: u16) -> Self {
        Self {
            target_sample_rate,
            target_channels,
        }
    }

    pub fn convert_to_mono_16bit_16khz(
        &self,
        samples: &[f32],
        source_rate: u32,
        channels: u16,
    ) -> Result<Vec<i16>, DublyError> {
        let mut mono_samples: Vec<f32> = if channels > 1 {
            samples
                .chunks(channels as usize)
                .map(|chunk| chunk.iter().sum::<f32>() / channels as f32)
                .collect()
        } else {
            samples.to_vec()
        };

        if source_rate != self.target_sample_rate {
            let ratio = self.target_sample_rate as f32 / source_rate as f32;
            let new_len = (mono_samples.len() as f32 * ratio) as usize;
            let mut resampled = Vec::with_capacity(new_len);
            for i in 0..new_len {
                let src_idx = (i as f32 / ratio) as usize;
                if src_idx < mono_samples.len() {
                    resampled.push(mono_samples[src_idx]);
                }
            }
            mono_samples = resampled;
        }

        let pcm_16: Vec<i16> = mono_samples
            .iter()
            .map(|&s| {
                let clamped = s.max(-1.0).min(1.0);
                (clamped * 32767.0) as i16
            })
            .collect();

        Ok(pcm_16)
    }
}
