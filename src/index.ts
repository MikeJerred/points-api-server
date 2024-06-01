import 'dotenv/config';
import app from './app';

process.on('uncaughtException', error => {
  console.error('Uncaught Exception', error);
  process.exit(1);
});

const port = parseInt(process.env['PORT'] ?? '8080');
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));

export default app;
