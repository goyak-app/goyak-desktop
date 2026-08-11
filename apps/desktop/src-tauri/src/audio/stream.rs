use crate::errors::DublyError;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;

pub struct AudioPipelineStream {
    is_running: Arc<AtomicBool>,
}

impl AudioPipelineStream {
    pub fn new() -> Self {
        Self {
            is_running: Arc::new(AtomicBool::new(false)),
        }
    }

    pub fn start(&self) -> Result<(), DublyError> {
        self.is_running.store(true, Ordering::SeqCst);
        Ok(())
    }

    pub fn stop(&self) -> Result<(), DublyError> {
        self.is_running.store(false, Ordering::SeqCst);
        Ok(())
    }

    pub fn is_active(&self) -> bool {
        self.is_running.load(Ordering::SeqCst)
    }
}
