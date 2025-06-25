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
import { MESSAGE_PRODUCER } from '../../utils/constants';

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
      setError(MESSAGE_PRODUCER.ERROR_FETCH_PARTITIONS);
    }
  };

  const handleSendMessage = async () => {
    if (!message.value.trim()) {
      setError(MESSAGE_PRODUCER.ERROR_MESSAGE_REQUIRED);
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
      
      setSuccess(MESSAGE_PRODUCER.SUCCESS_MESSAGE_SENT);
      setMessage({ key: '', value: '', format: 'json' });
      
      if (onMessageSent) {
        onMessageSent();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error.response?.data?.error || MESSAGE_PRODUCER.ERROR_SEND_MESSAGE);
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
            label={MESSAGE_PRODUCER.LABEL_MESSAGE_KEY_OPTIONAL}
            value={message.key}
            onChange={(e) => setMessage(prev => ({ ...prev, key: e.target.value }))}
            placeholder={MESSAGE_PRODUCER.PLACEHOLDER_MESSAGE_KEY}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>{MESSAGE_PRODUCER.LABEL_MESSAGE_FORMAT}</InputLabel>
            <Select
              value={message.format}
              label={MESSAGE_PRODUCER.LABEL_MESSAGE_FORMAT}
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
            label={MESSAGE_PRODUCER.LABEL_MESSAGE_VALUE}
            value={message.value}
            onChange={(e) => setMessage(prev => ({ ...prev, value: e.target.value }))}
            multiline
            rows={4}
            placeholder={MESSAGE_PRODUCER.PLACEHOLDER_MESSAGE_VALUE}
            onKeyPress={handleKeyPress}
            helperText={MESSAGE_PRODUCER.HELPER_TEXT_SEND}
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
          label={MESSAGE_PRODUCER.LABEL_SELECT_PARTITION}
        />
      </Box>

      {useManualPartition && (
        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth>
            <InputLabel>{MESSAGE_PRODUCER.LABEL_PARTITION}</InputLabel>
            <Select
              value={selectedPartition}
              label={MESSAGE_PRODUCER.LABEL_PARTITION}
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
          {loading ? MESSAGE_PRODUCER.BUTTON_SENDING : MESSAGE_PRODUCER.BUTTON_SEND_MESSAGE}
        </Button>
      </Box>
    </Paper>
  );
}

export default MessageProducer; 





