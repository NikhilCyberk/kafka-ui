import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,       
  Switch,
  Alert,
  CircularProgress,
  Grid,
  Divider
} from '@mui/material';
import { Send } from '@mui/icons-material';
import { produceMessageWithPartition, getTopicPartitions } from '../../services/api';

function MessageProducer({ topicName, onMessageSent }) {
  const [message, setMessage] = useState({
    key: '',
    value: '',
    format: 'json'
  });
  const [useManualPartition, setUseManualPartition] = useState(false);
  const [selectedPartition, setSelectedPartition] = useState('');
  const [partitions, setPartitions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (topicName) {
      fetchPartitions();
    }
  }, [topicName]);

  const fetchPartitions = async () => {
    try {
      const response = await getTopicPartitions(topicName);
      // Backend returns { topic, partitions: [{id, leader, replicas, isr}], total_partitions }
      const partitionsArray = response.partitions || [];
      setPartitions(partitionsArray);
      if (partitionsArray.length > 0) {
        setSelectedPartition(partitionsArray[0].id.toString());
      }
    } catch (error) {
      console.error('Error fetching partitions:', error);
      setError('Failed to fetch topic partitions');
    }
  };

  const handleSendMessage = async () => {
    if (!message.value.trim()) {
      setError('Message value is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const messageData = {
        ...message,
        target_partition: useManualPartition ? parseInt(selectedPartition) : undefined
      };

      await produceMessageWithPartition(topicName, messageData);
      
      setSuccess('Message sent successfully!');
      setMessage({ key: '', value: '', format: 'json' });
      
      if (onMessageSent) {
        onMessageSent();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error.response?.data?.error || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSendMessage();
    }
  };

  return (
    
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <Send sx={{ mr: 1 }} />
        Send Message to  {topicName}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Message Key (optional)"
            value={message.key}
            onChange={(e) => setMessage(prev => ({ ...prev, key: e.target.value }))}
            placeholder="Enter message key..."
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Message Format</InputLabel>
            <Select
              value={message.format}
              label="Message Format"
              onChange={(e) => setMessage(prev => ({ ...prev, format: e.target.value }))}
            >
              <MenuItem value="json">JSON</MenuItem>
              <MenuItem value="string">String</MenuItem>
              <MenuItem value="avro">Avro</MenuItem>
              <MenuItem value="protobuf">Protobuf</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Message Value"
            value={message.value}
            onChange={(e) => setMessage(prev => ({ ...prev, value: e.target.value }))}
            multiline
            rows={4}
            placeholder="Enter your message here..."
            onKeyPress={handleKeyPress}
            helperText="Press Ctrl+Enter (or Cmd+Enter) to send"
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={useManualPartition}
              onChange={(e) => setUseManualPartition(e.target.checked)}
            />
          }
          label="Select specific partition"
        />
      </Box>

      {useManualPartition && (
        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Partition</InputLabel>
            <Select
              value={selectedPartition}
              label="Partition"
              onChange={(e) => setSelectedPartition(e.target.value)}
            >
              {partitions.map((partition) => (
                <MenuItem key={partition.id} value={partition.id.toString()}>
                  Partition {partition.id}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSendMessage}
          disabled={loading || !message.value.trim()}
          startIcon={loading ? <CircularProgress size={20} /> : <Send />}
        >
          {loading ? 'Sending...' : 'Send Message'}
        </Button>
      </Box>
    </Paper>
  );
}

export default MessageProducer; 





